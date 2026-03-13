import { DatabaseModel } from "./DatabaseModel.js";

const database = new DatabaseModel().pool;

class Aluno {

    private id_aluno: number = 0;
    private ra: string = "";
    private nome: string;
    private sobrenome: string;
    private data_nascimento: Date;
    private endereco: string;
    private email: string;
    private celular: string;
    private status_aluno: boolean = true;

    constructor(
        _nome: string,
        _sobrenome: string,
        _data_nascimento: Date,
        _endereco: string,
        _email: string,
        _celular?: string
    ) {
        this.nome = _nome;
        this.sobrenome = _sobrenome;
        this.data_nascimento = _data_nascimento;
        this.endereco = _endereco;
        this.email = _email;
        this.celular = _celular ?? "";
    }

    // id_aluno
    public getIdAluno(): number {
        return this.id_aluno;
    }

    public setIdAluno(id_aluno: number): void {
        this.id_aluno = id_aluno;
    }

    // ra
    public getRa(): string {
        return this.ra;
    }

    public setRa(ra: string): void {
        this.ra = ra;
    }

    // nome
    public getNome(): string {
        return this.nome;
    }

    public setNome(nome: string): void {
        this.nome = nome;
    }

    // sobrenome
    public getSobrenome(): string {
        return this.sobrenome;
    }

    public setSobrenome(sobrenome: string): void {
        this.sobrenome = sobrenome;
    }

    // data_nascimento
    public getDataNascimento(): Date {
        return this.data_nascimento;
    }

    public setDataNascimento(data_nascimento: Date): void {
        this.data_nascimento = data_nascimento;
    }

    // endereco
    public getEndereco(): string {
        return this.endereco;
    }

    public setEndereco(endereco: string): void {
        this.endereco = endereco;
    }

    // email
    public getEmail(): string {
        return this.email;
    }

    public setEmail(email: string): void {
        this.email = email;
    }

    // celular
    public getCelular(): string {
        return this.celular;
    }

    public setCelular(celular: string): void {
        this.celular = celular;
    }

    // ra
    public getRA(): string {
        return this.ra;
    }

    public setRA(ra: string): void {
        this.ra = ra;
    }

    // status_aluno
    public getStatusAluno(): boolean {
        return this.status_aluno;
    }

    public setStatusAluno(status_aluno: boolean): void {
        this.status_aluno = status_aluno;
    }

    /**
     * Retorna uma lista com todos os alunos cadastrados no banco de dados
     * 
     * @returns Lista com todos os alunos cadastrados no banco de dados
     */
    static async listarAlunos(): Promise<Array<Aluno> | null> {
        // Criando lista vazia para armazenar os alunos
        let listaDeAlunos: Array<Aluno> = [];

        try {
            // Query para consulta no banco de dados
            const querySelectAluno = `SELECT * FROM Aluno WHERE status_aluno = TRUE;`;

            // executa a query no banco de dados
            const respostaBD = await database.query(querySelectAluno);

            // percorre cada resultado retornado pelo banco de dados
            // aluno é o apelido que demos para cada linha retornada do banco de dados
            respostaBD.rows.forEach((aluno: any) => {

                // criando objeto aluno
                let novoAluno = new Aluno(
                    aluno.nome,
                    aluno.sobrenome,
                    aluno.data_nascimento,
                    aluno.endereco,
                    aluno.email,
                    aluno.celular
                );
                // adicionando o ID ao objeto
                novoAluno.setIdAluno(aluno.id_aluno);
                novoAluno.setRA(aluno.ra);
                novoAluno.setStatusAluno(aluno.status_aluno);

                // adicionando a pessoa na lista
                listaDeAlunos.push(novoAluno);
            });

            // retornado a lista de pessoas para quem chamou a função
            return listaDeAlunos;
        } catch (error) {
            // exibe detalhes do erro no console
            console.log(`Erro ao acessar o modelo: ${error}`);
            // retorna nulo
            return null;
        }
    }

}

export default Aluno;