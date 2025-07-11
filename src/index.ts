import { Velish } from "./structures/client/index";
import colors from "colors";

colors.enable();
const client = new Velish();
client.start().catch(console.error);
