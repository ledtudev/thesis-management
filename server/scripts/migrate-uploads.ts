const fs = require('fs');
const path = require('path');

// Directory paths
const OLD_UPLOAD_DIR = 'uploads';
const NEW_BASE_DIR = 'uploads';
const AVATAR_DIR = path.join(NEW_BASE_DIR, 'avatars');
const PROJECT_REPORT_DIR = path.join(NEW_BASE_DIR, 'project-reports');
const PROPOSAL_DIR = path.join(NEW_BASE_DIR, 'proposals');
const ATTACHMENT_DIR = path.join(NEW_BASE_DIR, 'attachments');

// Create directories if they don't exist
function ensureDirectoriesExist() {
  [
    NEW_BASE_DIR,
    AVATAR_DIR,
    PROJECT_REPORT_DIR,
    PROPOSAL_DIR,
    ATTACHMENT_DIR,
  ].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Directory created: ${dir}`);
    }
  });
}

// Move files from the root directory
function moveFiles() {
  // Check if old directory exists
  if (!fs.existsSync(OLD_UPLOAD_DIR)) {
    console.log(`Old directory does not exist: ${OLD_UPLOAD_DIR}`);
    return;
  }

  // Read the list of files in the old directory
  const files = fs.readdirSync(OLD_UPLOAD_DIR);
  console.log(`Found ${files.length} files in the old directory`);

  // Count the number of files moved
  let movedCount = {
    avatar: 0,
    projectReport: 0,
    proposal: 0,
    attachment: 0,
  };

  // Move each file
  files.forEach((filename) => {
    const oldPath = path.join(OLD_UPLOAD_DIR, filename);

    // Skip if it's a directory
    if (fs.lstatSync(oldPath).isDirectory()) {
      console.log(`Skipping directory: ${oldPath}`);
      return;
    }

    // Determine file type and destination directory
    let targetDir = ATTACHMENT_DIR;
    let fileType = 'attachment';

    const ext = path.extname(filename).toLowerCase();

    // File classification logic
    if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
      if (filename.includes('avatar') || filename.includes('profile')) {
        targetDir = AVATAR_DIR;
        fileType = 'avatar';
      } else {
        targetDir = ATTACHMENT_DIR;
        fileType = 'attachment';
      }
    } else if (['.pdf', '.doc', '.docx'].includes(ext)) {
      if (filename.includes('proposal') || filename.includes('outline')) {
        targetDir = PROPOSAL_DIR;
        fileType = 'proposal';
      } else if (filename.includes('report') || filename.includes('final')) {
        targetDir = PROJECT_REPORT_DIR;
        fileType = 'projectReport';
      } else {
        targetDir = ATTACHMENT_DIR;
        fileType = 'attachment';
      }
    }

    // Move file
    const newPath = path.join(targetDir, filename);
    try {
      fs.copyFileSync(oldPath, newPath);
      movedCount[fileType]++;
      console.log(`Moved "${filename}" to "${targetDir}"`);
    } catch (error) {
      console.error(`Error moving file "${filename}": ${error.message}`);
    }
  });

  console.log('\nMovement Results:');
  console.log(`- Avatars: ${movedCount.avatar} files`);
  console.log(`- Project Reports: ${movedCount.projectReport} files`);
  console.log(`- Proposals: ${movedCount.proposal} files`);
  console.log(`- Other Attachments: ${movedCount.attachment} files`);
  console.log(
    `- Total: ${Object.values(movedCount).reduce((a, b) => a + b, 0)} files`,
  );
}

// Run script
console.log('Starting file upload migration...');
ensureDirectoriesExist();
moveFiles();
console.log('File upload migration completed.');
