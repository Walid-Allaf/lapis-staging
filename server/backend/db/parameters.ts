import "server-only";
import sql from "mssql";
import { DatabaseError } from "./errors";

export interface SqlParameter {
  name: string;
  type: sql.ISqlType;
  value: unknown;
}

export function bindParameters(request: sql.Request, parameters: readonly SqlParameter[]): sql.Request {
  const names = new Set<string>();
  for (const parameter of parameters) {
    const key = parameter.name.toLowerCase();
    if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(parameter.name) || names.has(key) || parameter.value === undefined || !parameter.type) {
      throw new DatabaseError("DB_QUERY_FAILED");
    }
    names.add(key);
    request.input(parameter.name, parameter.type, parameter.value);
  }
  return request;
}

export async function query<Row extends object>(
  executor: sql.ConnectionPool | sql.Transaction,
  text: string,
  parameters: readonly SqlParameter[] = [],
): Promise<sql.IResult<Row>> {
  try { return await bindParameters(executor.request(), parameters).query<Row>(text); }
  catch { throw new DatabaseError("DB_QUERY_FAILED"); }
}
