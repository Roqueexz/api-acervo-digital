import Livro from "../model/Livro.js";
import { type Request, type Response } from "express";

class LivroController extends Livro {
    static async todos(req: Request, res: Response) {
        try {
            const listaDeLivros = await Livro.listarLivros();
            return res.status(200).json(listaDeLivros);
        } catch (error) {
            console.error(`Erro ao listar livros: ${error}`);
            return res.status(500).json({ mensagem: "Erro ao recuperar as informações dos livros." });
        }
    }
}

export default LivroController;