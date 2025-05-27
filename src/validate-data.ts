// For all data in the data
// go through each file and validate the data against the schema

import { defaultConfigSchema } from "./config-schema";
import fs from "node:fs";
import path from "node:path";

const dataDir = path.join(__dirname, "..", "data");

const files = fs.readdirSync(dataDir);
const validateData = async () => {
  const jsonFiles = files.filter((file) => file.endsWith(".json"));
  
  if (jsonFiles.length === 0) {
    console.log("No JSON files found in data directory");
    return;
  }

  for (const file of jsonFiles) {
    const filePath = path.join(dataDir, file);
    console.log(`Validating ${file}...`);
    
    try {
      const fileContent = fs.readFileSync(filePath, "utf8");
      const data = JSON.parse(fileContent);
      
      const result = defaultConfigSchema.safeParse(data);
      
      if (!result.success) {
        console.error(`❌ Error validating ${file}:`);
        console.error("Validation errors:");
        result.error.errors.forEach((error, index) => {
          console.error(`  ${index + 1}. Path: ${error.path.join('.')} - ${error.message}`);
        });
        throw new Error(`Validation failed for ${file}`);
      }
      
      console.log(`✅ ${file} validated successfully`);
    } catch (parseError) {
      if (parseError instanceof SyntaxError) {
        console.error(`❌ JSON parsing error in ${file}: ${parseError.message}`);
        throw parseError;
      }
      throw parseError;
    }
  }
  
  console.log(`\n🎉 Validation of ${jsonFiles.length} JSON file(s) completed successfully`);
  console.log("All files conform to the schema and contain only allowed fields.");
};

const main = () => {
  validateData().catch((error) => {
    console.error("\n💥 Validation failed:", error.message);
    process.exit(1);
  });
};

main();