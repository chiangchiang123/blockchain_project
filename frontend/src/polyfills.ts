import { Buffer } from "buffer";
import process from "process";

(globalThis as any).Buffer = Buffer;
(globalThis as any).process = process;
(globalThis as any).global = globalThis;