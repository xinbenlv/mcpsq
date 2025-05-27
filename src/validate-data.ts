// For all data in the data
// go through each file and validate the data against the schema

import { defaultConfigSchema } from "./config-schema";
import fs from "node:fs";
import path from "node:path";

const dataDir = path.join(__dirname, "..", "data");

const files = fs.readdirSync(dataDir);
const validateData = async () => {
  for (const file of files) {
    const filePath = path.join(dataDir, file);
    const fileContent = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(fileContent);
    const result = defaultConfigSchema.safeParse(data);
    if (!result.success) {
      console.error(`Error validating ${file}: ${result.error}`);
      throw new Error(`Error validating ${file}: ${result.error}`);
    }
  }
  console.log(`Validation of ${files.length} data files completed successfully`);
};

const main = () => {
  validateData();
};

main();