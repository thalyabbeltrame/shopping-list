import { PrismaClient } from '@prisma/client';
import supertest from 'supertest';
import app from '../src/app';

import { itemsFactory } from './factories/itemsFactory';

const client = new PrismaClient();

beforeEach(async () => {
  await client.$executeRaw`TRUNCATE TABLE items;`;
});

afterAll(async () => {
  await client.$disconnect();
});

describe('Testa POST /items ', () => {
  const newItem = itemsFactory.getNewItem();

  it('Deve retornar 201, se cadastrado um item no formato correto', async () => {
    const result = await supertest(app).post('/items').send(newItem);

    expect(result.status).toEqual(201);
  });

  it('Deve retornar 409, ao tentar cadastrar um item que exista', async () => {
    await supertest(app).post('/items').send(newItem);
    const result = await supertest(app).post('/items').send(newItem);

    expect(result.status).toEqual(409);
  });
});

describe('Testa GET /items ', () => {
  it('Deve retornar status 200 e o body no formato de Array', async () => {
    const result = await supertest(app).get('/items');

    expect(result.status).toEqual(200);
    expect(result.body).toBeInstanceOf(Array);
  });
});

describe('Testa GET /items/:id ', () => {
  const newItem = itemsFactory.getNewItem();

  it('Deve retornar status 200 e um objeto igual a o item cadastrado', async () => {
    const result = await supertest(app).post('/items').send(newItem);
    const resultGet = await supertest(app).get(`/items/${result.body.id}`);

    delete resultGet.body.id;

    expect(resultGet.status).toEqual(200);
    expect(resultGet.body).toEqual(newItem);
  });

  it('Deve retornar status 404 caso não exista um item com esse id', async () => {
    const result = await supertest(app).post('/items').send(newItem);
    const resultGet = await supertest(app).get(`/items/${result.body.id + 1}`);

    expect(resultGet.status).toEqual(404);
  });
});
