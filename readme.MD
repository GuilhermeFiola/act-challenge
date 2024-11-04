
# Act Digital Tech Test

Este projeto foi desenvolvido como parte de um desafio de programação.

A aplicação tem como objetivo principal a criação de serviços:
- Controlar o seu fluxo de caixa diário com os lançamentos de débitos e créditos
- Disponibilização do saldo diário consolidado

## Decisões Técnicas

Como decisão para linguagem de programação defini a utilização de TypeScript pois é uma linguagem moderna e tem a vantagem da identificação antecipada de erros e uma maior clareza no desenvolvimento e análise do código.

Além da definição da linguagem, preferi utilizar clean arch para dividir as responsabilidades no projeto,transformando entradas e saídas, possui camadas de aplicação e domínio para execução da lógica assim como a camada de infra. Os componentes possuem responsabilidades específicas e foram criados de maneira isolada para facilitar os testes do sistema.

Também são utilizados DTOs para controlar entradas e saídas de dados.

## Decisões Arquiteturais

Foram pedidos dois requisitos não funcionais e as decisões arquiteturais foram tomadas de forma a atender ambos.

- **Requisito de confiabilidade:** Em dias de picos, o serviço de consolidado diário recebe 500 requisições por segundos, com no máximo 5% de perda de requisições.

- **Requisito de tolerância a falhas:** O serviço de controle de lançamento não deve ficar indisponível se o sistema de consolidado diário cair.

O sistema foi dividido em duas APIs, uma voltada para as transações (transaction-api) e a outra voltada para a consolidação (consolidation-api). Com essa abordagem os sistemas ficam independentes, sendo que a queda de um não afeta a disponibilidade do outro. Essa decisão supre o requisito de tolerância a falhas.

Para suprir o requisito de confiabilidade utilizei uma fila para que toda a transação possa ser recebida pela API de consolidação. A fila tendo mensagens persistentes permitem que mesmo em caso de falha da mesma com que ela não perca mensagens já recebidas. Assim, a cada transação é criada uma mensagem na fila, a API de consolidação possui um serviço com um método único para atualizar o saldo diário e assim que atualiza o saldo também é atualizado um cache em memória. Dessa maneira as consultas não precisam ir até o banco de dados em todas as consultas sendo que o cache terá os valores atualizados. Com isso foi possível utilizar o Artillery com 500 requisições em 1 segundo e o sistema respondeu sem falhas.

Além disso a utilização da fila consegue combinar benefícios nos dois requisitos, sendo que mesmo que o sistema de consolidação caia, a fila continua a receber as movimentações sem problemas. Uma vez que o sistema de consolidação voltar a funcionar todas as mensagens na fila são processadas pela API e o saldo é atualizado.

Abaixo está o diagrama com o desenho arquitetural da solução assim como as tabelas criadas.

![Diagrama](/act-arch-diagram.jpg)

Alguns logs do Artillery requisitando o saldo diário pode ser encontrado no arquivo: [Artillery Load Test](./consolidation-load-test-result)

## Justificativa para o Uso de Frameworks ou Bibliotecas

A aplicação é construída para ser executada em um ambiente Node.js.

- **typescript**: Proporciona tipagem estática, reduzindo a probabilidade de erros em tempo de execução e melhorando a legibilidade do código.
- **jest**: Biblioteca para escrever testes e suporte a mocks, facilitando a verificação de chamadas de funções.
- **esLint**: Biblioteca para realizar a validação estática do código e formatação de arquivos em cima de regras definidas.
- **dotenv**: Biblioteca para realizar o controle de variáveis de ambiente.
- **express**: Framework web usado para construir APIs e aplicações web. Proporciona uma estrutura simplificada para lidar com rotas, middleware e respostas HTTP.
- **helmet**: Middleware para segurança em aplicações Express, adicionando headers de segurança HTTP para proteger contra ataques comuns.
- **sqlite**: Banco de dados SQL leve e autossuficiente, adequado para projetos de pequeno a médio porte e para desenvolvimento local, armazenando dados em um único arquivo.
- **uuid**:  Biblioteca para gerar identificadores únicos universais (UUIDs).
- **amqplib**: Biblioteca para comunicação com o RabbitMQ e outras plataformas AMQP, permitindo a criação e consumo de filas para troca de mensagens.
- **node-cache**: Biblioteca para cache em memória no lado do servidor, usada para armazenar dados temporariamente e melhorar a performance ao reduzir consultas repetidas.
- **tsyringe**: Biblioteca para injeção de dependência em TypeScript, facilitando o gerenciamento e a resolução de dependências. Foi utilizada especialmente devido o cache precisar ser singleton.

## Instruções sobre Como Compilar e Executar o Projeto

1. **Ambiente de execução:**
- Para a execução desse projeto é recomendado utilizar o Docker. Como são utilizados tipos diferentes de recursos, inclusive uma fila de mensagens foi a melhor solução para uma execução limpa.
- Para a instalação do Docker recomendo acessar o link [Docker Install](https://docs.docker.com/engine/install/) e escolher a versão a ser utilizada dependendo do sistema operacional.

2. **Utilizar o comando Docker Compose para subir os recursos**

   Estando na raiz do projeto (local onde se encontra o arquivo `docker-compose.yml`, executar o comando abaixo:

   ```bash  
     
    docker compose up -d
     
   ```  

   Apenas aguardar até o console exibir as mensagens:

   ```bash
   Listening on port 7000

   Listening on port 7001
   ```
   Como existe uma dependência do RabbitMQ, ambas as APIs consultam esse serviço para executarem.

3. **Realização das chamadas HTTP**



- Utilizar o comando **create** para transpilar o código e executar os testes. Com isso será gerado o relatório de coverage dos testes.

```bash  
  
npm run create  
  
```  

4. Instale a aplicação:

```bash  
  
npm run local  
  
```  
5. Execute o sistema utilizando o comando:
- Com o projeto foram colocados os casos em arquivos `txt` no diretório `transactions`. Com isso é possível chamar o executável passando os arquivos.
```bash  
  
capital-gains < transactions/case1.txt  
  
```  
- Caso queira informar manualmente os dados não informar o path para o arquivo txt. Será esperada a entrada do usuário até a entrada de uma linha vazia. Após esse caso será executado o código.
```bash  
  
capital-gains  
  
```  
- Caso ocorra algum erro na instalação, ainda será possível executar o sistema usando o comando:
```bash  
  
node dist/src/index.js < transactions/case1.txt  
  
```  
Ou informando dados manualmente:
```bash  
  
node dist/src/index.js  
  
```  

## Notas Adicionais

- Certifique-se de que todas as dependências estejam instaladas corretamente antes de executar a aplicação ou os testes.
- Tive problemas com Mock do Jest e isso causou problemas com o InputHandler. Decidi continuar sem os testes dessa classe pois essa não é uma classe de negócio (sem diminuir a importância dessa classe).
- Agradeço se puder passar o feedback para o recrutador, assim me ajuda a entender pontos de falha independente da continuação do processo.