import { revalidatePath } from "next/cache";
import {
  fetchLeverJobs,
  getConfiguredLeverBoards,
  getLeverKeywords,
  jobMatchesLeverKeywords,
  mapLeverJobToInternshipInput,
  parseLeverBoards,
} from "@/app/lib/integrations/lever";
import { syncInternshipByUrl } from "@/app/lib/models/Internship";

export type LeverSyncRequest = {
  boardsText?: string;
  keywordsText?: string;
};

export type LeverBoardSyncResult = {
  slug: string;
  companyName: string;
  fetched: number;
  matched: number;
  created: number;
  updated: number;
  unchanged: number;
  error?: string;
};

export type LeverSyncTotals = {
  fetched: number;
  matched: number;
  created: number;
  updated: number;
  unchanged: number;
};

export type LeverSyncResult = {
  ok: boolean;
  message: string;
  keywords: string[];
  boards: LeverBoardSyncResult[];
  totals: LeverSyncTotals;
  status: number;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown Lever sync error";
}

export async function runLeverSync(
  request: LeverSyncRequest = {},
): Promise<LeverSyncResult> {
  const boards =
    typeof request.boardsText === "string" && request.boardsText.trim()
      ? parseLeverBoards(request.boardsText)
      : getConfiguredLeverBoards();

  if (boards.length === 0) {
    return {
      ok: false,
      message:
        "No Lever boards configured. Add LEVER_BOARDS or submit board slugs in the sync form.",
      keywords: [],
      boards: [],
      totals: {
        fetched: 0,
        matched: 0,
        created: 0,
        updated: 0,
        unchanged: 0,
      },
      status: 400,
    };
  }

  const keywords = getLeverKeywords(
    typeof request.keywordsText === "string" ? request.keywordsText : undefined,
  );

  const boardResults: LeverBoardSyncResult[] = [];

  for (const board of boards) {
    const boardResult: LeverBoardSyncResult = {
      slug: board.slug,
      companyName: board.companyName,
      fetched: 0,
      matched: 0,
      created: 0,
      updated: 0,
      unchanged: 0,
    };

    try {
      const jobs = await fetchLeverJobs(board.slug);
      boardResult.fetched = jobs.length;

      const matchedJobs = jobs.filter((job) =>
        jobMatchesLeverKeywords(job, keywords),
      );
      boardResult.matched = matchedJobs.length;

      for (const job of matchedJobs) {
        const internship = mapLeverJobToInternshipInput(board, job);
        const synced = await syncInternshipByUrl(
          internship.company_name,
          internship.job_description,
          internship.url,
        );

        if (synced.status === "created") {
          boardResult.created += 1;
        } else if (synced.status === "updated") {
          boardResult.updated += 1;
        } else {
          boardResult.unchanged += 1;
        }
      }
    } catch (error) {
      boardResults.push({
        ...boardResult,
        error: getErrorMessage(error),
      });
      continue;
    }

    boardResults.push(boardResult);
  }

  const totals = boardResults.reduce<LeverSyncTotals>(
    (summary, board) => ({
      fetched: summary.fetched + board.fetched,
      matched: summary.matched + board.matched,
      created: summary.created + board.created,
      updated: summary.updated + board.updated,
      unchanged: summary.unchanged + board.unchanged,
    }),
    {
      fetched: 0,
      matched: 0,
      created: 0,
      updated: 0,
      unchanged: 0,
    },
  );

  const hasSuccessfulBoard = boardResults.some((board) => !board.error);
  if (hasSuccessfulBoard) {
    revalidatePath("/manage-internships");
    revalidatePath("/employer/manage-internships");
    revalidatePath("/opportunities");
  }

  return {
    ok: hasSuccessfulBoard,
    message: hasSuccessfulBoard ? "Lever sync completed" : "Lever sync failed",
    keywords,
    boards: boardResults,
    totals,
    status: hasSuccessfulBoard ? 200 : 502,
  };
}
