import Aluno from "../model/Aluno.js";
import { type Request, type Response } from "express";
import type AlunoDTO from "../dto/AlunoDTO.js";

class AlunoController extends Aluno {

    /**
     * Lista todos os alunos.
     * @param req Objeto de requisição HTTP.
     * @param res Objeto de resposta HTTP.
     * @returns Lista de alunos em formato JSON.
     */
    static async todos(req: Request, res: Response) {
        try {
            const listaDeAlunos = await Aluno.listarAlunos(); // recupera lista de alunos
            res.status(200).json(listaDeAlunos); // retorna JSON com a lista de alunos
        } catch (error) {
            console.log(`Erro ao acessar método herdado: ${error}`);    // Exibe erros da consulta no console
            res.status(500).json("Erro ao recuperar as informações do aluno.");  // Retorna mensagem de erro com status code 400
        }
    }

    /**
     * Retorna informações de um aluno
     * @param req Objeto de requisição HTTP
     * @param res Objeto de resposta HTTP.
     * @returns Informações de aluno em formato JSON.
     */
    static async aluno(req: Request, res: Response) {
        try {
            const idAluno = parseInt(req.query.idAluno as string);

            const aluno = await Aluno.listarAluno(idAluno);
            res.status(200).json(aluno);
        } catch (error) {
            console.log(`Erro ao acessar método herdado: ${error}`);    // Exibe erros da consulta no console
            res.status(500).json("Erro ao recuperar as informações do aluno.");  // Retorna mensagem de erro com status code 400
        }
    }

    /**
      * Cadastra um novo aluno.
      * @param req Objeto de requisição HTTP com os dados do aluno.
      * @param res Objeto de resposta HTTP.
      * @returns Mensagem de sucesso ou erro em formato JSON.
      */
    static async cadastrar(req: Request, res: Response) {
        try {
            // Desestruturando objeto recebido pelo front-end
            const dadosRecebidos: AlunoDTO = req.body;

            // Instanciando objeto Aluno
            const novoAluno = new Aluno(
                dadosRecebidos.nome,
                dadosRecebidos.sobrenome,
                dadosRecebidos.data_nascimento ?? new Date("1900-01-01"),
                dadosRecebidos.endereco ?? '',
                dadosRecebidos.email ?? '',
                dadosRecebidos.celular
            );

            // Chama o método para persistir o aluno no banco de dados
            const result = await Aluno.cadastrarAluno(novoAluno);

            // Verifica se a query foi executada com sucesso
            if (result) {
                return res.status(201).json({ mensagem: `Aluno cadastrado com sucesso.` });
            } else {
                return res.status(500).json({ mensagem: 'Não foi possível cadastrar o aluno no banco de dados.' });
            }
        } catch (error) {
            console.log(`Erro ao cadastrar o aluno: ${error}`);
            return res.status(500).json({ mensagem: 'Erro ao cadastrar o aluno.' });
        }
    }


}

export default AlunoController;