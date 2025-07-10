import { Velish } from "./structures/Client/index";
import colors from 'colors';

colors.enable();
const client = new Velish();
client.start().catch(console.error);