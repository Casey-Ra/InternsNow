import { revalidatePath } from "next/cache";
import {
  fetchGreenhouseJobs,
  getConfiguredGreenhouseBoards,
  getGreenhouseKeywords,
  jobMatchesGreenhouseKeywords,
  mapGreenhouseJobToInternshipInput,
  parseGreenhouseBoards,
} from "@/app/lib/integrations/greenhouse";
import { syncInternshipByUrl } from "@/app/lib/models/Internship";

export type GreenhouseSyncRequest = {
  boardsText?: string;
  keywordsText?: string;
};

export type GreenhouseBoardSyncResult = {
  token: string;
  companyName: string;
  fetched: number;
  matched: number;
  created: number;
  updated: number;
  unchanged: number;
  error?: string;
};

export type GreenhouseSyncTotals = {
  fetched: number;
  matched: number;
  created: number;
  updated: number;
  unchanged: number;
};

export type GreenhouseSyncResult = {
  ok: boolean;
  message: string;
  keywords: string[];
  boards: GreenhouseBoardSyncResult[];
  totals: GreenhouseSyncTotals;
  status: number;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown Greenhouse sync error";
}

export async function runGreenhouseSync(
  request: GreenhouseSyncRequest = {},
): Promise<GreenhouseSyncResult> {
  const boards =
    typeof request.boardsText === "string" && request.boardsText.trim()
      ? parseGreenhouseBoards(request.boardsText)
      : getConfiguredGreenhouseBoards();

  if (boards.length === 0) {
    return {
      ok: false,
      message:
        "No Greenhouse boards configured. Add GREENHOUSE_BOARDS or submit board tokens in the sync form.",
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

  const keywords = getGreenhouseKeywords(
    typeof request.keywordsText === "string" ? request.keywordsText : undefined,
  );

  const boardResults: GreenhouseBoardSyncResult[] = [];

  for (const board of boards) {
    const boardResult: GreenhouseBoardSyncResult = {
      token: board.token,
      companyName: board.companyName,
      fetched: 0,
      matched: 0,
      created: 0,
      updated: 0,
      unchanged: 0,
    };

    try {
      const jobs = await fetchGreenhouseJobs(board.token);
      boardResult.fetched = jobs.length;

      const matchedJobs = jobs.filter((job) =>
        jobMatchesGreenhouseKeywords(job, keywords),
      );
      boardResult.matched = matchedJobs.length;

      for (const job of matchedJobs) {
        const internship = mapGreenhouseJobToInternshipInput(board, job);
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

  const totals = boardResults.reduce<GreenhouseSyncTotals>(
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
    revalidatePath("/student/find-opportunities");
  }

  return {
    ok: hasSuccessfulBoard,
    message: hasSuccessfulBoard
      ? "Greenhouse sync completed"
      : "Greenhouse sync failed",
    keywords,
    boards: boardResults,
    totals,
    status: hasSuccessfulBoard ? 200 : 502,
  };
}
