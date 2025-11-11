export interface SoldDevice {
  data: string;
  aparelho: string;
  cor: string;
  condicao: string;
  imei: string;
  fornecedor: string;
  valor_compra: number;
  comprador: string;
  numero_telefone: string;
  aparelho_recebido: boolean;
  observacao: string;
  valor_recebido: number;
  preco_vista: number;
  preco_cartao: number;
  valor_entrega: number;
  valor_capa_pelicula: number;
  valor_total_venda: number;
}

export interface StockDevice {
  modelo: string;
  cor: string;
  fornecedor: string;
  imei: string;
  observacao: string;
  valor_unitario: number;
  valor_total_estoque: number | null;
}

export const soldDevices: SoldDevice[] = [
  {
    data: "2025-11-10",
    aparelho: "iPhone 15 Pro Max",
    cor: "Titânio Natural",
    condicao: "Novo",
    imei: "355678901234567",
    fornecedor: "Apple Store",
    valor_compra: 8500.0,
    comprador: "Carlos Silva",
    numero_telefone: "+55 (11) 98765-4321",
    aparelho_recebido: true,
    observacao: "Caixa original lacrada",
    valor_recebido: 8500.0,
    preco_vista: 8200.0,
    preco_cartao: 8800.0,
    valor_entrega: 25.0,
    valor_capa_pelicula: 150.0,
    valor_total_venda: 8375.0,
  },
  {
    data: "2025-11-09",
    aparelho: "Samsung Galaxy S24 Ultra",
    cor: "Preto",
    condicao: "Seminovo",
    imei: "356789012345678",
    fornecedor: "Cliente",
    valor_compra: 3200.0,
    comprador: "Maria Santos",
    numero_telefone: "+55 (11) 91234-5678",
    aparelho_recebido: true,
    observacao: "Pequeno risco na tela, funciona perfeitamente",
    valor_recebido: 3000.0,
    preco_vista: 3500.0,
    preco_cartao: 3800.0,
    valor_entrega: 15.0,
    valor_capa_pelicula: 120.0,
    valor_total_venda: 3635.0,
  },
  {
    data: "2025-11-08",
    aparelho: "iPhone 14 128GB",
    cor: "Azul",
    condicao: "Usado",
    imei: "357890123456789",
    fornecedor: "Pedro",
    valor_compra: 2500.0,
    comprador: "Ana Oliveira",
    numero_telefone: "+55 (11) 99876-5432",
    aparelho_recebido: false,
    observacao: "Aguardando entrega do fornecedor",
    valor_recebido: 0.0,
    preco_vista: 2800.0,
    preco_cartao: 3100.0,
    valor_entrega: 20.0,
    valor_capa_pelicula: 100.0,
    valor_total_venda: 0.0,
  },
  {
    data: "2025-11-07",
    aparelho: "iPhone 13 Pro 256GB",
    cor: "Verde Alpino",
    condicao: "Recondicionado",
    imei: "358901234567890",
    fornecedor: "Loja XYZ",
    valor_compra: 3800.0,
    comprador: "João Pereira",
    numero_telefone: "+55 (11) 94567-8901",
    aparelho_recebido: true,
    observacao: "Bateria 100%, com nota fiscal",
    valor_recebido: 3800.0,
    preco_vista: 4200.0,
    preco_cartao: 4500.0,
    valor_entrega: 30.0,
    valor_capa_pelicula: 180.0,
    valor_total_venda: 4410.0,
  },
  {
    data: "2025-11-06",
    aparelho: "iPhone 12 64GB",
    cor: "Preto",
    condicao: "Tela quebrada",
    imei: "359012345678901",
    fornecedor: "Cliente",
    valor_compra: 800.0,
    comprador: "Roberto Lima",
    numero_telefone: "+55 (11) 92345-6789",
    aparelho_recebido: true,
    observacao: "Tela trincada, mas funciona normalmente",
    valor_recebido: 800.0,
    preco_vista: 1500.0,
    preco_cartao: 1800.0,
    valor_entrega: 10.0,
    valor_capa_pelicula: 80.0,
    valor_total_venda: 1590.0,
  },
];

export const stockDevices: StockDevice[] = [
  {
    modelo: "iPhone 13 128GB",
    cor: "BRANCO",
    fornecedor: "PEDRO",
    imei: "359451183944323",
    observacao: "",
    valor_unitario: 2300.0,
    valor_total_estoque: null,
  },
  {
    modelo: "iPhone 14 Pro 256GB",
    cor: "ROXO",
    fornecedor: "CLIENTE",
    imei: "357712769705269",
    observacao: "TELA QUEBRADA",
    valor_unitario: 3000.0,
    valor_total_estoque: null,
  },
  {
    modelo: "iPhone 12 Pro 128GB",
    cor: "GOLD/DOURADO",
    fornecedor: "CLIENTE",
    imei: "353781188276016",
    observacao: "",
    valor_unitario: 2000.0,
    valor_total_estoque: 550440.0,
  },
  {
    modelo: "iPhone 13 128GB",
    cor: "AZUL",
    fornecedor: "PEDRO",
    imei: "350183986872570",
    observacao: "",
    valor_unitario: 2300.0,
    valor_total_estoque: null,
  },
];
