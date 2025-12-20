export interface StockItem {
  id: number;
  imei: string;
  modelo: string;
  marca: string;
  cor: string;
  capacidade: string;
  valor_unitario: number;
  condicao: string;
  dataEntrada: string; // formato YYYY-MM-DD
  fornecedor: string;
  observacao: string;
}
