import fs from 'fs-extra';

export class FileHelper {
  /**
   * Remove recursivamente uma pasta e seu conteúdo.
   *
   * @param folderPath - O caminho da pasta a ser excluída.
   * @returns Uma Promise que é resolvida quando a pasta é excluída com sucesso.
   * @throws Uma exceção é lançada se ocorrer algum erro ao excluir a pasta.
   */
  static async deleteFolderRecursive(folderPath: string): Promise<void> {
    try {
      await fs.remove(folderPath);
      console.log(`Pasta excluída com sucesso: ${folderPath}`);
    } catch (error) {
      console.log(`Erro ao excluir pasta: ${error}`);
      throw error;
    }
  }
}
