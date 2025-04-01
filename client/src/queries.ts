import { mergeQueryKeys } from "@lukemorales/query-key-factory";
import { ingredients } from "./queries/ingredients";
import { logs } from "./queries/logs";
import { meals } from "./queries/meals";
import { members } from "./queries/members";
import { monitoring } from "./queries/monitoring";

export const queries = mergeQueryKeys(members, ingredients, meals, monitoring, logs);
