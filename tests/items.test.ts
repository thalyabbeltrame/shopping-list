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
  const newItem = itemsFactory.validInput();

  it('Deve retornar 201, se cadastrado um item no formato correto', async () => {
    const result = await supertest(app).post('/items').send(newItem);
    const status = result.status;
    expect(status).toEqual(201);
  });

  it('Deve retornar 409, ao tentar cadastrar um item que exista', async () => {
    await supertest(app).post('/items').send(newItem);
    const result = await supertest(app).post('/items').send(newItem);
    const status = result.status;
    expect(status).toEqual(409);
  });
});

describe('Testa GET /items ', () => {
  it('Deve retornar status 200 e o body no formato de Array', async () => {
    const result = await supertest(app).get('/items');
    const status = result.status;
    expect(status).toEqual(200);

    const body = result.body;
    expect(Array.isArray(body)).toBe(true);
  });
});

describe('Testa GET /items/:id ', () => {
  it('Deve retornar status 200 e um objeto igual a o item cadastrado', async () => {
    const newItem = itemsFactory.validInput();

    const result = await supertest(app).post('/items').send(newItem);
    const id = result.body.id;
    const resultGet = await supertest(app).get(`/items/${id}`);

    const status = resultGet.status;
    expect(status).toEqual(200);

    const body = resultGet.body;
    delete body.id;
    expect(body).toEqual(newItem);
  });

  it('Deve retornar status 404 caso não exista um item com esse id', async () => {
    const newItem = itemsFactory.validInput();
    const result = await supertest(app).post('/items').send(newItem);
    const id = result.body.id + 1;
    const resultGet = await supertest(app).get(`/items/${id}`);

    const status = resultGet.status;
    expect(status).toEqual(404);
  });
});
