#!/usr/bin/env node

import { program } from "commander";
import { GoogleGenAI, Type } from "@google/genai";
import readline from "readline";
import fs from "fs";

// Tool configuration - defined once for reuse
const TOOLS_CONFIG = {
  systemInstruction: "You are a coding agent. You MUST use the list_files and read_file functions to explore files. Never use code execution.",
  tools: [{
    functionDeclarations: [
      { name: 'list_files', description: 'List files in current directory', parameters: { type: Type.OBJECT, properties: {} } },
      { name: 'read_file', description: 'Read file content', parameters: { type: Type.OBJECT, properties: { filename: { type: Type.STRING } }, required: ['filename'] } }
    ]
  }],
  toolConfig: { functionCallingConfig: { mode: 'AUTO' } }
};

// Execute a tool call and return the result
function executeTool(call) {
  if (call.name === "list_files") return fs.readdirSync(".");
  if (call.name === "read_file") return fs.readFileSync(call.args.filename, "utf8");
  throw new Error(`Unknown tool: ${call.name}`);
}

async function startInteractiveMode(ai, verbose) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "> ",
  });

  console.log('AI Agent - Interactive Mode (type "exit" to quit)');
  rl.prompt();

  let history = [];

  rl.on("line", async (input) => {
    const trimmed = input.trim();

    if (trimmed === "exit") {
      rl.close();
      return;
    }

    if (trimmed === "clear") {
        history = []
        console.log("history cleared");
      }

    if (trimmed) {
      try {
        // Add user message to conversation history
        history.push({ role: "user", parts: [{ text: trimmed }] });
        
        // Get initial AI response
        let response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: history,
          config: TOOLS_CONFIG
        });

        // Agent feedback loop - continue until no more tools needed
        let iterations = 0;
        while (response.functionCalls && iterations < 10) {
          const toolCall = response.functionCalls[0];
          
          if (verbose) {
            console.log(`Tool ${iterations + 1}: ${toolCall.name}(${JSON.stringify(toolCall.args || {})})`);
          }
          
          // Execute the tool and get result
          const result = executeTool(toolCall);
          
          // Add tool call and result to history
          history.push({ role: "model", parts: [{ functionCall: toolCall }] });
          history.push({ role: "function", parts: [{ functionResponse: { name: toolCall.name, response: { result } } }] });
          
          // Get next AI response
          response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: history,
            config: TOOLS_CONFIG
          });
          
          iterations++;
        }
        
        // Display final result and add to history
        console.log(response.text);
        history.push({ role: "model", parts: [{ text: response.text }] });
        
      } catch (error) {
        console.error("Error:", error.message);
      }
    }

    rl.prompt();
  });

  rl.on("close", () => {
    console.log("Goodbye!");
    process.exit(0);
  });
}

program
  .version("1.0.0")
  .description("My Node CLI")
  .option("-a, --apiKey <type>", "Add your apikey")
  .option("-v, --verbose", "Enable verbose mode", false)
  .action(async (options) => {
    const ai = new GoogleGenAI({ apiKey: options.apiKey });

    if (options.verbose) {
      console.log("Gemini client initialized");
    }
    await startInteractiveMode(ai, options.verbose);
  });

program.parseAsync(process.argv);
