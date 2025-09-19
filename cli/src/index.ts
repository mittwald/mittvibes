#!/usr/bin/env node

import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ProjectConfig {
  mode: 'new' | 'existing';
  projectName: string;
  installDeps: boolean;
  setupDatabase: boolean;
  databaseUrl?: string;
  runMigration: boolean;
  isContributor: boolean;
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
    const { mode } = await inquirer.prompt<Pick<ProjectConfig, 'mode'>>([
      {
        type: 'list',
        name: 'mode',
        message: 'Are you starting a new project or continuing with an existing boilerplate?',
        choices: [
          { name: 'Start new project', value: 'new' as const },
          { name: 'Continue with existing boilerplate', value: 'existing' as const }
        ]
      }
    ]);

    if (mode === 'existing') {
      console.log(chalk.white('\n📁 Please navigate to your existing project directory and continue from there.'));
      process.exit(0);
    }

    // Step 2: Project Configuration
    const { projectName } = await inquirer.prompt<Pick<ProjectConfig, 'projectName'>>([
      {
        type: 'input',
        name: 'projectName',
        message: 'What is the name of your extension project?',
        default: 'my-mittwald-extension',
        validate: (input: string) => {
          if (/^[a-z0-9-]+$/.test(input)) {
            return true;
          }
          return 'Project name can only contain lowercase letters, numbers, and hyphens';
        }
      }
    ]);

    // Create project directory
    const projectPath = path.join(process.cwd(), projectName);
    if (await fs.pathExists(projectPath)) {
      console.log(chalk.bold.white(`\n❌ Directory ${projectName} already exists!`));
      process.exit(1);
    }

    const spinner = ora('Creating project structure...').start();

    // Copy templates (excluding node_modules)
    const templatesPath = path.join(__dirname, '..', '..', 'templates');
    await fs.copy(templatesPath, projectPath, {
      filter: (src) => !src.includes('node_modules')
    });

    // Update package.json with project name
    const packageJsonPath = path.join(projectPath, 'package.json');
    const packageJson = await fs.readJson(packageJsonPath);
    packageJson.name = projectName;
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });

    spinner.succeed(chalk.white('Project structure created!'));

    // Step 3: Dependency Installation
    const { installDeps } = await inquirer.prompt<Pick<ProjectConfig, 'installDeps'>>([
      {
        type: 'confirm',
        name: 'installDeps',
        message: 'Would you like to install dependencies now? (pnpm install)',
        default: true
      }
    ]);

    if (installDeps) {
      const installSpinner = ora('Installing dependencies with pnpm...').start();
      try {
        execSync('pnpm install', { cwd: projectPath, stdio: 'inherit' });
        installSpinner.succeed(chalk.white('Dependencies installed successfully!'));
      } catch (error) {
        installSpinner.fail(chalk.white('Failed to install dependencies'));
        console.log(chalk.gray('Please run "pnpm install" manually in your project directory.'));
      }
    }

    // Step 4: Prerequisites Setup
    console.log(chalk.bold.white('\n🗄️  Database Configuration\n'));

    const { setupDatabase } = await inquirer.prompt<Pick<ProjectConfig, 'setupDatabase'>>([
      {
        type: 'confirm',
        name: 'setupDatabase',
        message: 'Would you like to configure the PostgreSQL database now?',
        default: true
      }
    ]);

    if (setupDatabase) {
      const { databaseUrl } = await inquirer.prompt<Pick<ProjectConfig, 'databaseUrl'>>([
        {
          type: 'input',
          name: 'databaseUrl',
          message: 'Enter your PostgreSQL connection URL (non-pooling):',
          validate: (input: string) => {
            if (input.startsWith('postgresql://') || input.startsWith('postgres://')) {
              return true;
            }
            return 'Please enter a valid PostgreSQL URL (should start with postgresql:// or postgres://)';
          }
        }
      ]);

      // Generate Prisma encryption key
      const encryptionKey = generateEncryptionKey();

      // Create .env file
      const envContent = `# Database
DATABASE_URL="${databaseUrl}"
PRISMA_FIELD_ENCRYPTION_KEY="${encryptionKey}"

# mittwald Extension
EXTENSION_ID=
EXTENSION_SECRET=

NODE_ENV=development
`;

      await fs.writeFile(path.join(projectPath, '.env'), envContent);
      console.log(chalk.white('✓ .env file created'));

      // Generate Prisma client and run migrations
      if (installDeps) {
        const { runMigration } = await inquirer.prompt<Pick<ProjectConfig, 'runMigration'>>([
          {
            type: 'confirm',
            name: 'runMigration',
            message: 'Would you like to generate Prisma client and run the initial migration?',
            default: true
          }
        ]);

        if (runMigration) {
          const migrationSpinner = ora('Generating Prisma client...').start();
          try {
            execSync('pnpm db:generate', { cwd: projectPath, stdio: 'pipe' });
            migrationSpinner.text = 'Running database migration...';
            execSync('pnpm db:migrate:deploy', { cwd: projectPath, stdio: 'pipe' });
            migrationSpinner.succeed(chalk.white('Database setup completed!'));
          } catch (error) {
            migrationSpinner.fail(chalk.white('Failed to setup database'));
            console.log(chalk.gray('Please run "pnpm db:generate" and "pnpm db:migrate:deploy" manually.'));
          }
        }
      }
    }

    // Runtime environment setup
    console.log(chalk.bold.white('\n🌐 Runtime Environment Setup\n'));
    console.log(chalk.white('Please follow these steps:'));
    console.log('1. Upload your generated hello world extension');
    console.log('2. Expose it to the internet (e.g., using ngrok, cloudflared, or a hosting service)');
    console.log('3. Note down the public URL for webhook configuration\n');

    // Step 5: Contributor Path Selection
    const { isContributor } = await inquirer.prompt<Pick<ProjectConfig, 'isContributor'>>([
      {
        type: 'list',
        name: 'isContributor',
        message: 'Are you already a mittwald contributor?',
        choices: [
          { name: 'Yes, I am a contributor', value: true },
          { name: 'No, not yet', value: false }
        ]
      }
    ]);

    if (isContributor) {
      console.log(chalk.bold.white('\n🎯 Contributor Setup Steps:\n'));

      console.log(chalk.bold('1. Configure Webhooks:'));
      console.log('   Go to mStudio Contributor UI and set your webhook URL');
      console.log('   Use a single webhook URL for all endpoints\n');

      console.log(chalk.bold('2. Set Required Scopes and Extension Context:'));
      console.log('   Configure scopes in mStudio Contributor UI');
      console.log('   Set extension context (project/customer)');
      console.log('   📚 Documentation: https://developer.mittwald.de/docs/v2/contribution/\n');

      console.log(chalk.bold('3. Configure Anchors:'));
      console.log('   Set anchors in mStudio Contributor UI');
      console.log('   Point them to http://localhost:5173 (your local dev server)');
      console.log('   📚 Documentation: https://developer.mittwald.de/de/docs/v2/contribution/reference/frontend-fragment-anchors/\n');

      console.log(chalk.bold('4. Perform First Installation:'));
      console.log('   Install your extension via API');
      console.log('   📚 API Docs: https://api.mittwald.de/v2/docs/#/Marketplace/extension-register-extension\n');

      console.log(chalk.bold('5. Start Development:'));
      console.log(chalk.white(`   cd ${projectName}`));
      console.log(chalk.white('   pnpm dev\n'));

      console.log(chalk.bold('6. Open Extension:'));
      console.log('   Open your extension in the selected anchor\n');

      console.log(chalk.bold.white('🎉 Congratulations! Your mittwald extension is ready for development!\n'));
    } else {
      console.log(chalk.bold.white('\n📚 Becoming a Contributor:\n'));
      console.log('To use mittwald extensions, you need to become a contributor first.');
      console.log('Please follow the guide at:');
      console.log(chalk.underline.white('https://developer.mittwald.de/de/docs/v2/contribution/how-to/become-contributor/\n'));
      console.log(chalk.gray('💡 Tip: Keep your boilerplate unchanged while you complete the contributor process.'));
      console.log('   You can come back and continue the setup once you\'re approved.\n');
    }

    console.log(chalk.white('━'.repeat(60)));
    console.log(chalk.bold.white('\n📁 Your project is ready at: ') + chalk.white(projectPath));
    console.log(chalk.white('━'.repeat(60) + '\n'));

  } catch (error) {
    console.error(chalk.bold.white('\n❌ Error:'), error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Generate a secure encryption key for Prisma field encryption
function generateEncryptionKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = '';
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

// Run the CLI
main().catch((error) => {
  console.error(chalk.bold.white('Fatal error:'), error);
  process.exit(1);
});