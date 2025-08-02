db.createCollection("restaurantes");
db.createCollection("cardapios");
db.createCollection("clientes");
db.createCollection("pedidos");
db.restaurantes.createIndex({ nome: 1 }, { unique: true });
db.clientes.createIndex({ telefone: 1 }, { unique: true });
