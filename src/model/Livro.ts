class Livro {
    private id_livro: number = 0;
    private titulo: string;
    private autor: string;
    private editora: string;
    private ano_publicacao: string;
    private isbn: string;
    private quant_total: number;
    private quant_disponivel: number;
    private valor_aquisicao: number;
    private status_livro_emprestado: string = "Disponível";
    private status_livro: boolean = false;

    constructor(
        _titulo: string,
        _autor: string,
        _editora: string,
        _ano_publicacao: string,
        _isbn: string,
        _quant_total: number,
        _quant_disponivel: number,
        _quant_aquisicao: number,
        _valor_aquisicao: number
    ) {
        this.titulo = _titulo;
        this.autor = _autor;
        this.editora = _editora;
        this.ano_publicacao = _ano_publicacao;
        this.isbn = _isbn;
        this.quant_total = _quant_total;
        this.quant_disponivel = _quant_disponivel;
        this.valor_aquisicao = _valor_aquisicao;
    }

    // Getters e Setters
    public getIdLivro(): number {
        return this.id_livro;
    }

    public setIdLivro(value: number) {
        this.id_livro = value;
    }

    public getTitulo(): string {
        return this.titulo;
    }

    public setTitulo(value: string) {
        this.titulo = value;
    }

    public getAutor(): string {
        return this.autor;
    }

    public setAutor(value: string) {
        this.autor = value;
    }

    public getEditora(): string {
        return this.editora;
    }

    public setEditora(value: string) {
        this.editora = value;
    }

    public getAnoPublicacao(): string {
        return this.ano_publicacao;
    }

    public setAnoPublicacao(value: string) {
        this.ano_publicacao = value;
    }

    public getIsbn(): string {
        return this.isbn;
    }

    public setIsbn(value: string) {
        this.isbn = value;
    }

    public getQuantTotal(): number {
        return this.quant_total;
    }

    public setQuantTotal(value: number) {
        this.quant_total = value;
    }

    public getQuantDisponivel(): number {
        return this.quant_disponivel;
    }

    public setQuantDisponivel(value: number) {
        this.quant_disponivel = value;
    }

    public getValorAquisicao(): number {
        return this.valor_aquisicao;
    }

    public setValorAquisicao(value: number) {
        this.valor_aquisicao = value;
    }

    public getStatusLivroEmprestado(): string {
        return this.status_livro_emprestado;
    }

    public setStatusLivroEmprestado(value: string) {
        this.status_livro_emprestado = value;
    }

    public getStatusLivro(): boolean {
        return this.status_livro;
    }

    public setStatusLivro(value: boolean) {
        this.status_livro = value;
    }
    
}

export default Livro;