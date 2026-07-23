import * as dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
(global as any).import = { meta: { env: process.env } };

import { db } from '../src/lib/db';

async function run() {
  try {
    const modules = await db.getModules();
    console.log("Modules:", modules.length);
    if (modules.length > 0) {
      const module = modules[0];
      const newLesson = {
        id: Date.now().toString(),
        title: "Test Lesson " + Date.now(),
        description: "Test",
      };
      
      const updatedModule = {
        ...module,
        lessons: [...module.lessons, newLesson]
      };
      
      console.log("Syncing module:", module.id, "with lessons:", updatedModule.lessons.length);
      await db.syncModule(updatedModule as any);
      console.log("Sync done.");
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
