# Manual release test

Run this checklist against the release ZIP, not only the source directory. Do
not use a private or sensitive repository during testing.

## Prepare

1. Run `npm ci`, `npm test`, `npm run check`, and `npm run format:check`.
2. Run `npm run package`.
3. Extract the ZIP from `dist/` into a new directory.
4. Open `chrome://extensions`, enable **Developer mode**, and select **Load unpacked**.
5. Load the extracted release directory and confirm that Chrome reports no manifest errors.

## First launch and language

1. Remove and reload the extension to start with empty local storage.
2. Open the popup and confirm that the language selection screen appears.
3. Select each language once and verify that headings, buttons, status messages,
   privacy warning, and service actions use the selected language.
4. Close and reopen Chrome, then confirm that the last selected language persists.

## Repository detection

1. Open `https://github.com/IRISX-AI/IRIS-AI` and confirm that the popup detects
   `IRISX-AI/IRIS-AI`.
2. Repeat from repository `issues`, `pulls`, `tree`, `blob`, and commit pages.
3. Open a GitHub profile page and confirm that it is not accepted as a repository.
4. Open `https://github.com/features/copilot` and confirm that it is rejected.
5. Open a non-GitHub page and confirm that the localized error is displayed.

## Links and prompt

1. Confirm that exactly five services are listed and that the header count matches.
2. Copy each service link and verify its owner/repository path.
3. Open each generated link and verify the destination URL before interacting with the third-party site.
4. Use **Copy 5 links** and confirm that the clipboard contains five lines in the displayed order.
5. Copy the AI analysis prompt in every language.
6. Confirm that each prompt contains the canonical GitHub URL and all five current service links.
7. Search the copied prompt for `undefined`, `[object Object]`, or missing URLs.

## Repository history

1. Copy one service link and open the history panel from the clock button.
2. Confirm that the list contains only the canonical `https://github.com/owner/repository` URL.
3. Copy the complete link list and prompt; confirm that they do not create duplicate history entries.
4. Repeat with another public repository and confirm that the newest URL appears first.
5. Copy a repository URL from history and verify the clipboard contents.
6. Open a repository from history and verify that Chrome navigates to its GitHub URL.
7. Add more than 10 public test repositories and confirm that only the newest 10 remain.
8. Select **Clear** and confirm that the list becomes empty.
9. Close and reopen Chrome and verify that uncleared history persists locally.

## Privacy and accessibility

1. Confirm that the public-repository warning is visible before the action buttons.
2. Navigate the complete popup using only `Tab`, `Shift+Tab`, `Enter`, and `Space`.
3. Confirm that every focused control has a clearly visible focus outline.
4. With a screen reader, verify that the language button has an accessible name and
   copy/error status changes are announced.
5. Test at 200% browser zoom and confirm that text remains readable without overlapping controls.
6. Enable the operating system's reduced-motion preference and confirm that the popup remains usable.

## Visual and release checks

1. Confirm that the toolbar and `chrome://extensions` display the project icon cleanly.
2. Check the popup at normal and narrow Chrome window sizes for clipping or unwanted scrollbars.
3. Confirm that `manifest.json`, `package.json`, the changelog, ZIP filename, and intended Git tag use the same version.
4. Inspect the ZIP and confirm that it contains runtime files and icons but excludes
   tests, `node_modules`, development documentation, and credentials.
5. After pushing the release tag, confirm that CI passes and the GitHub release contains the generated ZIP.
