#!/usr/bin/env node

import inquirer from "inquirer";
import chalk from "chalk";
import ora from "ora";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import { generateKey } from "@47ng/cloak";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ProjectConfig {
  mode: "new" | "existing";
  projectName: string;
  installDeps: boolean;
  setupDatabase: boolean;
  databaseUrl?: string;
  runMigration: boolean;
  isContributor: boolean;
  extensionId?: string;
  extensionSecret?: string;
}

// Welcome message with ASCII art
const welcomeArt = `
███╗   ███╗██╗████████╗████████╗██╗   ██╗██╗██████╗ ███████╗███████╗
████╗ ████║██║╚══██╔══╝╚══██╔══╝██║   ██║██║██╔══██╗██╔════╝██╔════╝
██╔████╔██║██║   ██║      ██║   ██║   ██║██║██████╔╝█████╗  ███████╗
██║╚██╔╝██║██║   ██║      ██║   ╚██╗ ██╔╝██║██╔══██╗██╔══╝  ╚════██║
██║ ╚═╝ ██║██║   ██║      ██║    ╚████╔╝ ██║██████╔╝███████╗███████║
╚═╝     ╚═╝╚═╝   ╚═╝      ╚═╝     ╚═══╝  ╚═╝╚═════╝ ╚══════╝╚══════╝

                    powered by weissaufschwarz
`;
console.log(chalk.bold.white(welcomeArt));

// Main CLI function
async function main(): Promise<void> {
  try {
    // Step 1: Welcome & Mode Selection
    const { mode } = await inquirer.prompt<Pick<ProjectConfig, "mode">>([
      {
        type: "list",
        name: "mode",
        message:
          "Are you starting a new project or continuing with an existing boilerplate?",
        choices: [
          { name: "Start new project", value: "new" as const },
          {
            name: "Continue with existing boilerplate",
            value: "existing" as const,
          },
        ],
      },
    ]);

    if (mode === "existing") {
      console.log(
        chalk.white(
          "\n📁 Please navigate to your existing project directory and continue from there."
        )
      );
      process.exit(0);
    }

    // Step 2: Project Configuration
    const { projectName } = await inquirer.prompt<
      Pick<ProjectConfig, "projectName">
    >([
      {
        type: "input",
        name: "projectName",
        message: "What is the name of your extension project?",
        default: "my-mittwald-extension",
        validate: (input: string) => {
          if (/^[a-z0-9-]+$/.test(input)) {
            return true;
          }
          return "Project name can only contain lowercase letters, numbers, and hyphens";
        },
      },
    ]);

    // Create project directory
    const projectPath = path.join(process.cwd(), projectName);
    if (await fs.pathExists(projectPath)) {
      console.log(
        chalk.bold.white(`\n❌ Directory ${projectName} already exists!`)
      );
      process.exit(1);
    }

    const spinner = ora("Creating project structure...").start();

    // Copy templates from bundled location (excluding node_modules)
    const templatesPath = path.join(__dirname, "templates");
    await fs.copy(templatesPath, projectPath, {
      filter: (src) => !src.includes("node_modules"),
    });

    // Update package.json with project name
    const packageJsonPath = path.join(projectPath, "package.json");
    const packageJson = await fs.readJson(packageJsonPath);
    packageJson.name = projectName;
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });

    spinner.succeed(chalk.white("Project structure created!"));

    // Step 3: Dependency Installation
    const { installDeps } = await inquirer.prompt<
      Pick<ProjectConfig, "installDeps">
    >([
      {
        type: "confirm",
        name: "installDeps",
        message: "Would you like to install dependencies now? (pnpm install)",
        default: true,
      },
    ]);

    if (installDeps) {
      const installSpinner = ora(
        "Installing dependencies with pnpm..."
      ).start();
      try {
        execSync("pnpm install", { cwd: projectPath, stdio: "inherit" });
        installSpinner.succeed(
          chalk.white("Dependencies installed successfully!")
        );
      } catch (error) {
        installSpinner.fail(chalk.white("Failed to install dependencies"));
        console.log(
          chalk.gray(
            'Please run "pnpm install" manually in your project directory.'
          )
        );
      }
    }

    // Step 4: Prerequisites Setup
    console.log(chalk.bold.white("\n🗄️  Database Configuration\n"));

    const { setupDatabase } = await inquirer.prompt<
      Pick<ProjectConfig, "setupDatabase">
    >([
      {
        type: "confirm",
        name: "setupDatabase",
        message: "Would you like to configure the PostgreSQL database now?",
        default: true,
      },
    ]);

    if (setupDatabase) {
      const { databaseUrl } = await inquirer.prompt<
        Pick<ProjectConfig, "databaseUrl">
      >([
        {
          type: "input",
          name: "databaseUrl",
          message: "Enter your PostgreSQL connection URL (non-pooling):",
          validate: (input: string) => {
            if (
              input.startsWith("postgresql://") ||
              input.startsWith("postgres://")
            ) {
              return true;
            }
            return "Please enter a valid PostgreSQL URL (should start with postgresql:// or postgres://)";
          },
        },
      ]);

      // Generate Prisma encryption key using @47ng/cloak
      const encryptionKey = generateKey();

      // Create .env file
      const envContent = `# Database
DATABASE_URL="${databaseUrl}"
PRISMA_FIELD_ENCRYPTION_KEY="${encryptionKey}"

# mittwald Extension
EXTENSION_ID=REPLACE_ME
EXTENSION_SECRET=REPLACE_ME

NODE_ENV=development
`;

      const envPath = path.join(projectPath, ".env");
      try {
        await fs.writeFile(envPath, envContent);
        // Verify the file was created
        if (await fs.pathExists(envPath)) {
          console.log(chalk.white(`✓ .env file created in ${projectName}/`));
        } else {
          console.log(
            chalk.bold.white(
              `⚠️  .env file creation may have failed in ${projectName}/`
            )
          );
        }
      } catch (error) {
        console.log(
          chalk.bold.white(
            `❌ Failed to create .env file: ${
              error instanceof Error ? error.message : error
            }`
          )
        );
        console.log(
          chalk.gray(
            "Please create the .env file manually with your database credentials."
          )
        );
      }

      // Generate Prisma client and run migrations
      if (installDeps) {
        const { runMigration } = await inquirer.prompt<
          Pick<ProjectConfig, "runMigration">
        >([
          {
            type: "confirm",
            name: "runMigration",
            message:
              "Would you like to generate Prisma client and run the initial migration?",
            default: true,
          },
        ]);

        if (runMigration) {
          const migrationSpinner = ora("Generating Prisma client...").start();
          try {
            execSync("pnpm db:generate", { cwd: projectPath, stdio: "pipe" });
            migrationSpinner.text = "Running database migration...";
            execSync("pnpm db:migrate:deploy", {
              cwd: projectPath,
              stdio: "pipe",
            });
            migrationSpinner.succeed(chalk.white("Database setup completed!"));
          } catch (error) {
            migrationSpinner.fail(chalk.white("Failed to setup database"));
            console.log(
              chalk.gray(
                'Please run "pnpm db:generate" and "pnpm db:migrate:deploy" manually.'
              )
            );
          }
        }
      }
    }

    // Runtime environment setup
    console.log(chalk.bold.white("\n🌐 Runtime Environment Setup\n"));
    console.log(chalk.white("Please follow these steps:"));
    console.log("1. Upload your generated hello world extension");
    console.log(
      "2. Expose it to the internet (e.g., using ngrok, cloudflared, or a hosting service)"
    );
    console.log("3. Note down the public URL for webhook configuration\n");

    // Step 5: Contributor Path Selection
    const { isContributor } = await inquirer.prompt<
      Pick<ProjectConfig, "isContributor">
    >([
      {
        type: "list",
        name: "isContributor",
        message: "Are you already a mittwald contributor?",
        choices: [
          { name: "Yes, I am a contributor", value: true },
          { name: "No, not yet", value: false },
        ],
      },
    ]);

    if (isContributor) {
      console.log(chalk.bold.white("\n🎯 Contributor Setup Steps:\n"));

      console.log(chalk.bold("1. Create Extension in Contributor UI:"));
      console.log('   Navigate to "Entwicklung" in your organisation');
      console.log("   Create a new extension and note the EXTENSION_ID");
      console.log(
        '   💡 Tip: The EXTENSION_ID is visible in the "Details" tab of your extension'
      );
      console.log(
        "   For EXTENSION_SECRET (optional for now, see docs if needed):"
      );
      console.log(
        "   📚 https://developer.mittwald.de/de/docs/v2/contribution/how-to/develop-frontend-fragment/#access-token-anfordern-um-auf-die-mittwald-api-zuzugreifen\n"
      );

      // Collect extension credentials after showing step 1
      const extensionConfig = await inquirer.prompt<
        Pick<ProjectConfig, "extensionId" | "extensionSecret">
      >([
        {
          type: "input",
          name: "extensionId",
          message: "Enter your EXTENSION_ID (from step 1):",
          validate: (input: string) => {
            if (input.trim().length > 0) {
              return true;
            }
            return "EXTENSION_ID is required";
          },
        },
        {
          type: "input",
          name: "extensionSecret",
          message:
            "Enter your EXTENSION_SECRET (optional, press Enter to use CHANGE_ME):",
          default: "CHANGE_ME",
        },
      ]);

      // Show remaining setup steps after credentials are collected
      console.log(chalk.bold("2. Configure Webhooks:"));
      console.log("   Go to mStudio Contributor UI and set your webhook URL");
      console.log(
        "   Example: https://your-domain.example/api/webhooks/mittwald"
      );
      console.log("   Use a single webhook URL for all endpoints\n");

      console.log(chalk.bold("3. Set Required Scopes and Extension Context:"));
      console.log("   Configure scopes in mStudio Contributor UI");
      console.log("   Set extension context (project/customer)");
      console.log(
        "   📚 Documentation: https://developer.mittwald.de/docs/v2/contribution/\n"
      );

      console.log(chalk.bold("4. Configure Anchors:"));
      console.log("   Set anchors in mStudio Contributor UI");
      console.log(
        "   Point them to http://localhost:5173 (your local dev server)"
      );
      console.log(
        "   📚 Documentation: https://developer.mittwald.de/de/docs/v2/contribution/reference/frontend-fragment-anchors/\n"
      );

      console.log(chalk.bold("5. Deploy Your Application:"));
      console.log("   Deploy your extension to a public URL");
      console.log("   Options: ngrok, cloudflared, Vercel, Railway, etc.");
      console.log("   Ensure your webhook endpoints are accessible\n");

      console.log(chalk.bold("6. Perform First Installation:"));
      console.log("   Install your extension via API");
      console.log(
        "   📚 API Docs: https://developer.mittwald.de/de/docs/v2/reference/marketplace/extension-create-extension-instance/\n"
      );

      console.log(chalk.bold("7. Start Development:"));
      console.log(chalk.white(`   cd ${projectName}`));
      console.log(chalk.white("   pnpm dev\n"));

      console.log(chalk.bold("8. Open Extension:"));
      console.log("   Open your extension in the selected anchor\n");

      // Update or create .env file with extension credentials
      const envPath = path.join(projectPath, ".env");
      try {
        let envContent = "";

        if (await fs.pathExists(envPath)) {
          // Update existing .env file
          envContent = await fs.readFile(envPath, "utf8");
          envContent = envContent.replace(
            "EXTENSION_ID=REPLACE_ME",
            `EXTENSION_ID=${extensionConfig.extensionId}`
          );
          envContent = envContent.replace(
            "EXTENSION_SECRET=REPLACE_ME",
            `EXTENSION_SECRET=${extensionConfig.extensionSecret || "CHANGE_ME"}`
          );
        } else {
          // Create new .env file with minimal content
          envContent = `# mittwald Extension
EXTENSION_ID=${extensionConfig.extensionId}
EXTENSION_SECRET=${extensionConfig.extensionSecret || "CHANGE_ME"}

NODE_ENV=development
`;
        }

        await fs.writeFile(envPath, envContent);
        console.log(chalk.white("✓ Extension credentials saved to .env file"));
      } catch (error) {
        console.log(
          chalk.bold.white(
            "⚠️  Could not save extension credentials to .env file"
          )
        );
        console.log(
          chalk.gray("Please create/update them manually in your .env file")
        );
      }

      console.log(
        chalk.bold.white(
          "🎉 Congratulations! Your mittwald extension is ready for development!\n"
        )
      );
    } else {
      console.log(chalk.bold.white("\n📚 Becoming a Contributor:\n"));
      console.log(
        "To use mittwald extensions, you need to become a contributor first."
      );
      console.log("Please follow the guide at:");
      console.log(
        chalk.underline.white(
          "https://developer.mittwald.de/de/docs/v2/contribution/how-to/become-contributor/\n"
        )
      );
      console.log(
        chalk.gray(
          "💡 Tip: Keep your boilerplate unchanged while you complete the contributor process."
        )
      );
      console.log(
        "   You can come back and continue the setup once you're approved.\n"
      );
    }

    console.log(chalk.white("━".repeat(60)));
    console.log(
      chalk.bold.white("\n📁 Your project is ready at: ") +
        chalk.white(projectPath)
    );
    console.log(chalk.white("━".repeat(60) + "\n"));
  } catch (error) {
    console.error(
      chalk.bold.white("\n❌ Error:"),
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  }
}

// Run the CLI
main().catch((error) => {
  console.error(chalk.bold.white("Fatal error:"), error);
  process.exit(1);
});
