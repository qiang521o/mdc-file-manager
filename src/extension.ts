import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * 插件激活函数
 * @param context 扩展上下文
 */
export async function activate(context: vscode.ExtensionContext) {
    console.log('MDC文件管理器插件正在启动...');
    console.log('MDC文件管理器插件已激活');

    // 注册命令：浏览内置资源
    const showBuiltinResourcesCommand = vscode.commands.registerCommand(
        'mdcManager.showBuiltinResources', 
        () => showBuiltinResources(context)
    );

    // 注册命令：选择外部文件
    const selectExternalFilesCommand = vscode.commands.registerCommand(
        'mdcManager.selectExternalFiles', 
        () => selectExternalFiles()
    );

    // 注册命令：一键导入全部内置模板
    const importAllBuiltinResourcesCommand = vscode.commands.registerCommand(
        'mdcManager.importAllBuiltinResources',
        () => importAllBuiltinResources(context)
    );

    // 注册命令：从Git仓库导入MDC文件
    const importFromGitRepositoryCommand = vscode.commands.registerCommand(
        'mdcManager.importFromGitRepository',
        () => importFromGitRepository()
    );

    context.subscriptions.push(
        showBuiltinResourcesCommand, 
        selectExternalFilesCommand,
        importAllBuiltinResourcesCommand,
        importFromGitRepositoryCommand
    );
}

/**
 * 显示内置资源选择界面
 * @param context 扩展上下文
 */
async function showBuiltinResources(context: vscode.ExtensionContext): Promise<void> {
    // 获取内置资源路径
    const resourcesPath = path.join(context.extensionPath, 'out', 'resources');
    
    if (!fs.existsSync(resourcesPath)) {
        vscode.window.showErrorMessage('找不到内置资源文件夹');
        return;
    }

    try {
        // 获取所有包含.mdc文件的文件夹
        const folders = fs.readdirSync(resourcesPath).filter(item => {
            const itemPath = path.join(resourcesPath, item);
            if (!fs.statSync(itemPath).isDirectory()) {
                return false;
            }
            // 检查文件夹是否包含.mdc文件
            const mdcFiles = fs.readdirSync(itemPath).filter(file => file.endsWith('.mdc'));
            return mdcFiles.length > 0;
        });

        if (folders.length === 0) {
            vscode.window.showInformationMessage('没有找到包含.mdc文件的文件夹');
            return;
        }

        // 创建选择项
        const folderItems: vscode.QuickPickItem[] = folders.map(folder => ({
            label: `📁 ${folder}`,
            description: `${folder} 文件夹`,
            detail: getFolderFileCount(path.join(resourcesPath, folder))
        }));

        // 添加查看所有文件的选项
        folderItems.unshift({
            label: '📋 查看所有文件',
            description: '显示所有.mdc文件',
            detail: '选择所有类别中的文件'
        });

        // 显示选择器
        const selectedItem = await vscode.window.showQuickPick(folderItems, {
            placeHolder: '选择要复制的文件夹或查看所有文件',
            canPickMany: false
        });

        if (!selectedItem) {
            return;
        }

        if (selectedItem.label === '📋 查看所有文件') {
            await showAllFiles(resourcesPath);
        } else {
            const folderName = selectedItem.label.replace('📁 ', '');
            await showFolderFiles(path.join(resourcesPath, folderName), folderName);
        }

    } catch (error) {
        vscode.window.showErrorMessage(`读取资源文件夹时出错: ${error}`);
    }
}

/**
 * 显示文件夹中的文件
 * @param folderPath 文件夹路径
 * @param folderName 文件夹名称
 */
async function showFolderFiles(folderPath: string, folderName: string): Promise<void> {
    try {
        const files = fs.readdirSync(folderPath)
            .filter(file => file.endsWith('.mdc'))
            .map(file => ({
                label: `📄 ${file}`,
                description: `${folderName} 文件夹`,
                detail: path.join(folderPath, file)
            }));

        if (files.length === 0) {
            vscode.window.showInformationMessage(`${folderName} 文件夹中没有.mdc文件`);
            return;
        }

        // 添加全选选项
        files.unshift({
            label: `✅ 复制${folderName}文件夹中的所有文件`,
            description: `复制 ${files.length - 1} 个文件`,
            detail: folderPath
        });

        const selectedFiles = await vscode.window.showQuickPick(files, {
            placeHolder: `选择要复制的文件 (${folderName})`,
            canPickMany: true
        });

        if (!selectedFiles || selectedFiles.length === 0) {
            return;
        }

        // 处理选择
        if (selectedFiles.some(item => item.label.startsWith('✅'))) {
            // 复制整个文件夹
            await copyFolderToCursor(folderPath, folderName);
        } else {
            // 复制选中的文件（保持目录结构）
            await copySelectedBuiltinFilesToCursor(selectedFiles.map(item => item.detail || ''), folderPath);
        }

    } catch (error) {
        vscode.window.showErrorMessage(`读取文件夹内容时出错: ${error}`);
    }
}

/**
 * 显示所有文件
 * @param resourcesPath 资源根路径
 */
async function showAllFiles(resourcesPath: string): Promise<void> {
    try {
        const allFiles: vscode.QuickPickItem[] = [];
        
        const folders = fs.readdirSync(resourcesPath).filter(item => {
            return fs.statSync(path.join(resourcesPath, item)).isDirectory();
        });

        for (const folder of folders) {
            const folderPath = path.join(resourcesPath, folder);
            const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.mdc'));
            
            files.forEach(file => {
                allFiles.push({
                    label: `📄 ${file}`,
                    description: `来自 ${folder} 文件夹`,
                    detail: path.join(folderPath, file)
                });
            });
        }

        if (allFiles.length === 0) {
            vscode.window.showInformationMessage('没有找到任何.mdc文件');
            return;
        }

        const selectedFiles = await vscode.window.showQuickPick(allFiles, {
            placeHolder: '选择要复制的文件',
            canPickMany: true
        });

        if (!selectedFiles || selectedFiles.length === 0) {
            return;
        }

        await copySelectedBuiltinFilesToCursor(selectedFiles.map(item => item.detail || ''), resourcesPath);

    } catch (error) {
        vscode.window.showErrorMessage(`显示所有文件时出错: ${error}`);
    }
}

/**
 * 选择外部文件
 */
async function selectExternalFiles(): Promise<void> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    
    // 显示关于隐藏文件的提示
    const showHiddenFilesInfo = await vscode.window.showInformationMessage(
        '选择MDC文件或文件夹。注意：如果您要选择.cursor/rules目录，请在文件对话框中显示隐藏文件。',
        '继续选择',
        '显示帮助'
    );
    
    if (showHiddenFilesInfo === '显示帮助') {
        const helpMessage = `在文件选择对话框中显示隐藏文件的方法：

🍎 macOS: 按 Cmd + Shift + . （点号）
💻 Windows: 右键点击 → 显示隐藏的项目
🐧 Linux: 右键点击 → 显示隐藏文件

这样您就可以看到 .cursor/rules 目录了！`;
        
        await vscode.window.showInformationMessage(helpMessage, { modal: true });
        return;
    }
    
    if (showHiddenFilesInfo !== '继续选择') {
        return;
    }
    
    const options: vscode.OpenDialogOptions = {
        canSelectMany: true,
        openLabel: '选择MDC文件',
        canSelectFiles: true,
        canSelectFolders: true,
        filters: {
            'MDC文件': ['mdc'],
            '所有文件': ['*']
        },
        // 设置默认路径为工作区根目录
        defaultUri: workspaceFolder ? workspaceFolder.uri : undefined
    };

    const fileUris = await vscode.window.showOpenDialog(options);
    
    if (!fileUris || fileUris.length === 0) {
        return;
    }

    const filesToCopy: string[] = [];

    for (const fileUri of fileUris) {
        const filePath = fileUri.fsPath;
        const stats = fs.statSync(filePath);

        if (stats.isFile()) {
            if (path.extname(filePath) === '.mdc') {
                filesToCopy.push(filePath);
            } else {
                vscode.window.showWarningMessage(`跳过非.mdc文件: ${path.basename(filePath)}`);
            }
        } else if (stats.isDirectory()) {
            // 扫描目录中的.mdc文件
            const mdcFiles = scanForMdcFiles(filePath);
            filesToCopy.push(...mdcFiles);
        }
    }

    if (filesToCopy.length === 0) {
        vscode.window.showInformationMessage('没有找到.mdc文件');
        return;
    }

    await copySelectedFilesToCursor(filesToCopy);
}



/**
 * 简单扫描目录中的.mdc文件
 */
function scanForMdcFiles(dirPath: string): string[] {
    const mdcFiles: string[] = [];
    
    try {
        const items = fs.readdirSync(dirPath);
        
        for (const item of items) {
            const itemPath = path.join(dirPath, item);
            const stats = fs.statSync(itemPath);
            
            if (stats.isFile() && path.extname(item) === '.mdc') {
                mdcFiles.push(itemPath);
            } else if (stats.isDirectory()) {
                // 递归扫描子目录
                mdcFiles.push(...scanForMdcFiles(itemPath));
            }
        }
    } catch (error) {
        console.error(`扫描目录时出错 ${dirPath}:`, error);
    }
    
    return mdcFiles;
}

/**
 * 复制整个文件夹到.cursor目录（保持目录结构）
 * @param folderPath 文件夹路径
 * @param folderName 文件夹名称
 */
async function copyFolderToCursor(folderPath: string, folderName: string): Promise<void> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    
    if (!workspaceFolder) {
        vscode.window.showErrorMessage('请先打开一个工作区');
        return;
    }

    try {
        const cursorDir = await ensureCursorDirectory(workspaceFolder.uri.fsPath);
        
        // 在.cursor目录下创建对应的文件夹
        const targetFolderPath = path.join(cursorDir, folderName);
        if (!fs.existsSync(targetFolderPath)) {
            fs.mkdirSync(targetFolderPath, { recursive: true });
        }
        
        const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.mdc'));
        
        let copiedCount = 0;
        
        for (const file of files) {
            const sourcePath = path.join(folderPath, file);
            const destPath = path.join(targetFolderPath, file);
            
            fs.copyFileSync(sourcePath, destPath);
            copiedCount++;
        }
        
        vscode.window.showInformationMessage(
            `成功复制 ${copiedCount} 个文件从 ${folderName} 文件夹到 .cursor/rules/${folderName} 目录`
        );
        
    } catch (error) {
        vscode.window.showErrorMessage(`复制文件夹时出错: ${error}`);
    }
}

/**
 * 复制选中的内置文件到.cursor目录（保持目录结构）
 * @param filePaths 文件路径数组
 * @param resourcesBasePath 资源根目录路径
 */
async function copySelectedBuiltinFilesToCursor(filePaths: string[], resourcesBasePath: string): Promise<void> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    
    if (!workspaceFolder) {
        vscode.window.showErrorMessage('请先打开一个工作区');
        return;
    }

    try {
        const cursorDir = await ensureCursorDirectory(workspaceFolder.uri.fsPath);
        let copiedCount = 0;
        
        for (const filePath of filePaths) {
            if (!fs.existsSync(filePath)) {
                continue;
            }
            
            // 计算相对于 resources 目录的相对路径
            const relativePath = path.relative(resourcesBasePath, filePath);
            const destPath = path.join(cursorDir, relativePath);
            
            // 确保目标目录存在
            const destDir = path.dirname(destPath);
            if (!fs.existsSync(destDir)) {
                fs.mkdirSync(destDir, { recursive: true });
            }
            
            fs.copyFileSync(filePath, destPath);
            copiedCount++;
        }
        
        vscode.window.showInformationMessage(
            `成功复制 ${copiedCount} 个文件到 .cursor/rules 目录（保持目录结构）`
        );
        
    } catch (error) {
        vscode.window.showErrorMessage(`复制文件时出错: ${error}`);
    }
}

/**
 * 复制选中的文件到.cursor目录（用于外部文件）
 * @param filePaths 文件路径数组
 */
async function copySelectedFilesToCursor(filePaths: string[]): Promise<void> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    
    if (!workspaceFolder) {
        vscode.window.showErrorMessage('请先打开一个工作区');
        return;
    }

    try {
        const cursorDir = await ensureCursorDirectory(workspaceFolder.uri.fsPath);
        let copiedCount = 0;
        
        for (const filePath of filePaths) {
            if (!fs.existsSync(filePath)) {
                continue;
            }
            
            const fileName = path.basename(filePath);
            const destPath = path.join(cursorDir, fileName);
            
            fs.copyFileSync(filePath, destPath);
            copiedCount++;
        }
        
        vscode.window.showInformationMessage(
            `成功复制 ${copiedCount} 个文件到 .cursor/rules 目录`
        );
        
    } catch (error) {
        vscode.window.showErrorMessage(`复制文件时出错: ${error}`);
    }
}

/**
 * 确保.cursor/rules目录存在
 * @param workspacePath 工作区路径
 * @returns .cursor/rules目录路径
 */
async function ensureCursorDirectory(workspacePath: string): Promise<string> {
    const cursorDir = path.join(workspacePath, '.cursor');
    const cursorRulesDir = path.join(cursorDir, 'rules');
    
    if (!fs.existsSync(cursorDir)) {
        fs.mkdirSync(cursorDir, { recursive: true });
        vscode.window.showInformationMessage('已创建 .cursor 目录');
    }
    
    if (!fs.existsSync(cursorRulesDir)) {
        fs.mkdirSync(cursorRulesDir, { recursive: true });
        vscode.window.showInformationMessage('已创建 .cursor/rules 目录');
    }
    
    return cursorRulesDir;
}

/**
 * 获取文件夹中文件数量信息
 * @param folderPath 文件夹路径
 * @returns 文件数量描述
 */
function getFolderFileCount(folderPath: string): string {
    try {
        if (!fs.existsSync(folderPath)) {
            return '文件夹不存在';
        }
        
        const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.mdc'));
        return `包含 ${files.length} 个 .mdc 文件`;
    } catch (error) {
        return '无法读取文件夹';
    }
}

/**
 * 一键导入全部内置模板文件
 * @param context 扩展上下文
 */
async function importAllBuiltinResources(context: vscode.ExtensionContext): Promise<void> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    
    if (!workspaceFolder) {
        vscode.window.showErrorMessage('请先打开一个工作区');
        return;
    }

    // 获取内置资源路径
    const resourcesPath = path.join(context.extensionPath, 'out', 'resources');
    
    if (!fs.existsSync(resourcesPath)) {
        vscode.window.showErrorMessage('找不到内置资源文件');
        return;
    }

    try {
        // 扫描所有包含.mdc文件的分类文件夹
        const allDirectories = fs.readdirSync(resourcesPath).filter(item => {
            const itemPath = path.join(resourcesPath, item);
            return fs.statSync(itemPath).isDirectory();
        });

        // 统计所有文件数量，只包含有.mdc文件的目录
        let totalFiles = 0;
        const filesByCategory: { [category: string]: string[] } = {};
        
        for (const category of allDirectories) {
            const categoryPath = path.join(resourcesPath, category);
            const files = fs.readdirSync(categoryPath).filter(file => file.endsWith('.mdc'));
            if (files.length > 0) {
                filesByCategory[category] = files;
                totalFiles += files.length;
            }
        }

        const categories = Object.keys(filesByCategory);

        if (categories.length === 0) {
            vscode.window.showInformationMessage('没有找到任何包含 .mdc 文件的文件夹');
            return;
        }

        // 显示确认对话框
        const categoryList = categories.map(cat => `  • ${cat} (${filesByCategory[cat].length} 个文件)`).join('\n');
        const confirmMessage = `这将会导入所有内置模板到您的 .cursor/rules 目录：\n\n共 ${totalFiles} 个模板文件，分布在 ${categories.length} 个分类中：\n${categoryList}\n\n⚠️ 注意：如果目标目录中存在同名文件或文件夹，将会被直接覆盖！\n\n您确定要继续吗？`;
        
        const result = await vscode.window.showWarningMessage(
            confirmMessage,
            { modal: true },
            '确定导入',
            '取消'
        );

        if (result !== '确定导入') {
            return;
        }

        // 执行导入
        const cursorDir = await ensureCursorDirectory(workspaceFolder.uri.fsPath);
        let totalCopied = 0;
        const results: string[] = [];

        for (const category of categories) {
            const categoryPath = path.join(resourcesPath, category);
            const targetCategoryPath = path.join(cursorDir, category);
            
            // 创建分类目录（如果不存在）
            if (!fs.existsSync(targetCategoryPath)) {
                fs.mkdirSync(targetCategoryPath, { recursive: true });
            }
            
            const files = filesByCategory[category];
            let categoryCount = 0;
            
            for (const file of files) {
                const sourcePath = path.join(categoryPath, file);
                const destPath = path.join(targetCategoryPath, file);
                
                try {
                    fs.copyFileSync(sourcePath, destPath);
                    categoryCount++;
                    totalCopied++;
                } catch (error) {
                    console.error(`复制文件 ${file} 时出错:`, error);
                }
            }
            
            if (categoryCount > 0) {
                results.push(`${category}: ${categoryCount} 个文件`);
            }
        }

        // 显示成功消息
        if (totalCopied > 0) {
            const successMessage = `✅ 成功导入 ${totalCopied} 个模板文件！\n\n导入统计：\n${results.map(r => `  • ${r}`).join('\n')}\n\n所有文件已保存到 .cursor/rules 目录中。`;
            
            vscode.window.showInformationMessage(successMessage);
        } else {
            vscode.window.showWarningMessage('没有成功复制任何文件。');
        }
        
    } catch (error) {
        vscode.window.showErrorMessage(`导入模板文件时出错: ${error}`);
    }
}



/**
 * 从Git仓库导入MDC文件
 */
async function importFromGitRepository(): Promise<void> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    
    if (!workspaceFolder) {
        vscode.window.showErrorMessage('请先打开一个工作区');
        return;
    }

    try {
        // 步骤1: 获取Git仓库地址
        const gitUrl = await vscode.window.showInputBox({
            prompt: '请输入Git仓库地址',
            placeHolder: '例如: https://github.com/username/repo.git',
            validateInput: (value) => {
                if (!value || value.trim() === '') {
                    return '请输入有效的Git仓库地址';
                }
                // 简单的Git URL验证
                if (!/^https?:\/\/.+\.git$|^git@.+:.+\.git$|^https?:\/\/.+\/.+$/.test(value.trim())) {
                    return '请输入有效的Git仓库地址（支持 HTTPS 或 SSH 格式）';
                }
                return null;
            }
        });

        if (!gitUrl) {
            return;
        }

        // 步骤2: 检查Git是否安装
        try {
            await execAsync('git --version');
        } catch (error) {
            vscode.window.showErrorMessage('未检测到Git工具，请先安装Git并确保其在PATH中');
            return;
        }

        // 步骤3: 创建临时目录
        const tempDir = path.join(os.tmpdir(), `mdc-git-import-${Date.now()}`);
        
        // 显示进度
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: '从Git仓库导入MDC文件',
            cancellable: true
        }, async (progress, token) => {
            try {
                // 步骤4: 克隆仓库
                progress.report({ increment: 0, message: '正在克隆Git仓库...' });
                
                await execAsync(`git clone "${gitUrl.trim()}" "${tempDir}"`);
                
                if (token.isCancellationRequested) {
                    await cleanupTempDirectory(tempDir);
                    return;
                }

                progress.report({ increment: 30, message: '正在扫描文件结构...' });

                // 步骤5: 扫描文件结构，查找.mdc文件
                const fileTree = await scanDirectoryForMdcFiles(tempDir);
                
                if (fileTree.files.length === 0 && fileTree.directories.length === 0) {
                    vscode.window.showWarningMessage('在Git仓库中未找到任何.mdc文件');
                    await cleanupTempDirectory(tempDir);
                    return;
                }

                if (token.isCancellationRequested) {
                    await cleanupTempDirectory(tempDir);
                    return;
                }

                progress.report({ increment: 60, message: '正在准备选择界面...' });

                // 步骤6: 显示文件选择界面
                const selectedItems = await showGitFileSelectionDialog(fileTree, tempDir);
                
                if (!selectedItems || selectedItems.length === 0) {
                    await cleanupTempDirectory(tempDir);
                    return;
                }

                if (token.isCancellationRequested) {
                    await cleanupTempDirectory(tempDir);
                    return;
                }

                progress.report({ increment: 80, message: '正在复制文件...' });

                // 步骤7: 导入选中的文件
                await importSelectedGitFiles(selectedItems, tempDir, workspaceFolder.uri.fsPath);
                
                progress.report({ increment: 100, message: '完成' });

            } catch (error) {
                throw error;
            } finally {
                // 步骤8: 清理临时文件
                await cleanupTempDirectory(tempDir);
            }
        });
        
    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes('not found') || error.message.includes('does not exist')) {
                vscode.window.showErrorMessage('仓库地址不存在或无法访问，请检查URL是否正确');
            } else if (error.message.includes('Authentication') || error.message.includes('Permission')) {
                vscode.window.showErrorMessage('身份验证失败，请检查您的Git凭据或仓库访问权限');
            } else {
                vscode.window.showErrorMessage(`Git导入失败: ${error.message}`);
            }
        } else {
            vscode.window.showErrorMessage('未知错误，请检查网络连接和Git配置');
        }
    }
}

/**
 * 扫描目录中的.mdc文件
 */
async function scanDirectoryForMdcFiles(rootPath: string): Promise<{ files: string[], directories: string[] }> {
    const result = { files: [] as string[], directories: [] as string[] };
    
    function scanRecursively(dirPath: string, relativePath: string = '') {
        try {
            const items = fs.readdirSync(dirPath);
            
            for (const item of items) {
                // 跳过.git目录和其他隐藏目录
                if (item.startsWith('.')) {
                    continue;
                }
                
                const fullPath = path.join(dirPath, item);
                const relativeFullPath = relativePath ? path.join(relativePath, item) : item;
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    // 检查目录中是否包含.mdc文件
                    const hasMdcFiles = hasNestedMdcFiles(fullPath);
                    if (hasMdcFiles) {
                        result.directories.push(relativeFullPath);
                    }
                    // 递归扫描子目录
                    scanRecursively(fullPath, relativeFullPath);
                } else if (stat.isFile() && item.endsWith('.mdc')) {
                    result.files.push(relativeFullPath);
                }
            }
        } catch (error) {
            console.error(`扫描目录 ${dirPath} 时出错:`, error);
        }
    }
    
    scanRecursively(rootPath);
    return result;
}

/**
 * 检查目录及其子目录中是否包含.mdc文件
 */
function hasNestedMdcFiles(dirPath: string): boolean {
    try {
        const items = fs.readdirSync(dirPath);
        
        for (const item of items) {
            if (item.startsWith('.')) {
                continue;
            }
            
            const fullPath = path.join(dirPath, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isFile() && item.endsWith('.mdc')) {
                return true;
            } else if (stat.isDirectory() && hasNestedMdcFiles(fullPath)) {
                return true;
            }
        }
    } catch (error) {
        console.error(`检查目录 ${dirPath} 时出错:`, error);
    }
    
    return false;
}

/**
 * 显示Git文件选择对话框
 */
async function showGitFileSelectionDialog(fileTree: { files: string[], directories: string[] }, tempDir: string): Promise<string[] | undefined> {
    const options: vscode.QuickPickItem[] = [];
    
    // 添加目录选项
    if (fileTree.directories.length > 0) {
        options.push({
            label: '📂 文件夹',
            kind: vscode.QuickPickItemKind.Separator
        });
        
        for (const dir of fileTree.directories) {
            const dirPath = path.join(tempDir, dir);
            const mdcCount = countMdcFilesInDirectory(dirPath);
            options.push({
                label: `📂 ${dir}`,
                description: `包含 ${mdcCount} 个 .mdc 文件`,
                detail: `选择整个文件夹（包括子目录）`,
                picked: false
            });
        }
    }
    
    // 添加文件选项
    if (fileTree.files.length > 0) {
        options.push({
            label: '📝 单个文件',
            kind: vscode.QuickPickItemKind.Separator
        });
        
        for (const file of fileTree.files) {
            options.push({
                label: `📝 ${path.basename(file)}`,
                description: path.dirname(file) !== '.' ? path.dirname(file) : '',
                detail: `单个 MDC 文件`,
                picked: false
            });
        }
    }
    
    if (options.length === 0) {
        return undefined;
    }
    
    const selectedItems = await vscode.window.showQuickPick(options, {
        canPickMany: true,
        placeHolder: `选择要导入的文件或文件夹 (共找到 ${fileTree.files.length} 个文件和 ${fileTree.directories.length} 个文件夹)`,
        title: '从Git仓库选择MDC文件'
    });
    
    if (!selectedItems || selectedItems.length === 0) {
        return undefined;
    }
    
    // 转换为文件路径
    const result: string[] = [];
    
    for (const item of selectedItems) {
        if (item.label.startsWith('📂 ')) {
            // 文件夹
            const dirName = item.label.substring(2); // 移除emoji
            result.push(dirName);
        } else if (item.label.startsWith('📝 ')) {
            // 单个文件
            const fileName = item.label.substring(2); // 移除emoji
            const fullFileName = fileTree.files.find(f => path.basename(f) === fileName);
            if (fullFileName) {
                result.push(fullFileName);
            }
        }
    }
    
    return result;
}

/**
 * 统计目录中的.mdc文件数量
 */
function countMdcFilesInDirectory(dirPath: string): number {
    let count = 0;
    
    try {
        const items = fs.readdirSync(dirPath);
        
        for (const item of items) {
            if (item.startsWith('.')) {
                continue;
            }
            
            const fullPath = path.join(dirPath, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isFile() && item.endsWith('.mdc')) {
                count++;
            } else if (stat.isDirectory()) {
                count += countMdcFilesInDirectory(fullPath);
            }
        }
    } catch (error) {
        console.error(`统计目录 ${dirPath} 中文件数量时出错:`, error);
    }
    
    return count;
}

/**
 * 导入选中的Git文件
 */
async function importSelectedGitFiles(selectedItems: string[], tempDir: string, workspaceRoot: string): Promise<void> {
    const cursorDir = await ensureCursorDirectory(workspaceRoot);
    let totalCopied = 0;
    const results: string[] = [];
    
    for (const item of selectedItems) {
        const sourcePath = path.join(tempDir, item);
        
        try {
            const stat = fs.statSync(sourcePath);
            
            if (stat.isDirectory()) {
                // 复制整个目录
                const copied = await copyGitDirectoryToCursor(sourcePath, cursorDir, item);
                totalCopied += copied;
                if (copied > 0) {
                    results.push(`${item}: ${copied} 个文件`);
                }
            } else if (stat.isFile() && item.endsWith('.mdc')) {
                // 复制单个文件
                const destPath = path.join(cursorDir, item);
                
                // 确保目标目录存在
                const destDir = path.dirname(destPath);
                if (!fs.existsSync(destDir)) {
                    fs.mkdirSync(destDir, { recursive: true });
                }
                
                fs.copyFileSync(sourcePath, destPath);
                totalCopied++;
                results.push(`${path.basename(item)}: 1 个文件`);
            }
        } catch (error) {
            console.error(`复制文件 ${item} 时出错:`, error);
        }
    }
    
            // 显示结果
        if (totalCopied > 0) {
            const successMessage = `✅ 成功从Git仓库导入 ${totalCopied} 个 MDC 文件！\n\n导入统计：\n${results.map(r => `  • ${r}`).join('\n')}\n\n所有文件已保存到 .cursor/rules 目录中。`;
            vscode.window.showInformationMessage(successMessage);
        } else {
            vscode.window.showWarningMessage('没有成功复制任何文件。');
        }
}

/**
 * 复制Git目录到.cursor目录
 */
async function copyGitDirectoryToCursor(sourcePath: string, cursorDir: string, relativePath: string): Promise<number> {
    let copiedCount = 0;
    
    try {
        const items = fs.readdirSync(sourcePath);
        
        for (const item of items) {
            if (item.startsWith('.')) {
                continue;
            }
            
            const sourceItemPath = path.join(sourcePath, item);
            const stat = fs.statSync(sourceItemPath);
            
            if (stat.isFile() && item.endsWith('.mdc')) {
                const destPath = path.join(cursorDir, relativePath, item);
                const destDir = path.dirname(destPath);
                
                // 确保目标目录存在
                if (!fs.existsSync(destDir)) {
                    fs.mkdirSync(destDir, { recursive: true });
                }
                
                fs.copyFileSync(sourceItemPath, destPath);
                copiedCount++;
            } else if (stat.isDirectory()) {
                // 递归复制子目录
                const subRelativePath = path.join(relativePath, item);
                copiedCount += await copyGitDirectoryToCursor(sourceItemPath, cursorDir, subRelativePath);
            }
        }
    } catch (error) {
        console.error(`复制目录 ${sourcePath} 时出错:`, error);
    }
    
    return copiedCount;
}

/**
 * 清理临时目录
 */
async function cleanupTempDirectory(tempDir: string): Promise<void> {
    try {
        if (fs.existsSync(tempDir)) {
            // 在Windows上使用rimraf或递归删除
            if (process.platform === 'win32') {
                await execAsync(`rmdir /s /q "${tempDir}"`);
            } else {
                await execAsync(`rm -rf "${tempDir}"`);
            }
            console.log(`已清理临时目录: ${tempDir}`);
        }
    } catch (error) {
        console.error(`清理临时目录失败: ${error}`);
        // 不抛出异常，只记录日志
    }
}

/**
 * 插件停用函数
 */
export function deactivate() {
    console.log('MDC文件管理器插件已停用');
}
