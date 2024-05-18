import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UserModule } from '../src/user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../src//schema/user.model';
import { config } from 'dotenv';
import { JwtModule } from '@nestjs/jwt';

config();

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [
        UserModule,
        MongooseModule.forRoot('mongodb://localhost:27017/test'),
        JwtModule.register({ secret: process.env.JWT_SECRET }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    const userModel = moduleFixture.get(getModelToken(User.name));
    await userModel.deleteMany({});
  });

  it('/user/register (POST)', () => {
    return request(app.getHttpServer())
      .post('/user/register')
      .send({
        email: 'user@example.com',
        username: 'user',
        password: 'password',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.email).toBe('user@example.com');
        expect(res.body.username).toBe('user');
      });
  });

  it('/user/register (POST) - Error if email already in use', async () => {
    const userModel = moduleFixture.get(getModelToken(User.name));
    await userModel.create({
      email: 'user@example.com',
      username: 'existing_user',
      password: 'existing_password',
    });

    return request(app.getHttpServer())
      .post('/user/register')
      .send({
        email: 'user@example.com',
        username: 'user',
        password: 'password',
      })
      .expect(400)
      .expect((res) => {
        expect(res.body.message).toBe('Email is already in use');
      });
  });

  it('/user/login (POST)', async () => {
    await request(app.getHttpServer()).post('/user/register').send({
      email: 'user@example.com',
      username: 'user',
      password: 'password',
    });

    return request(app.getHttpServer())
      .post('/user/login')
      .send({
        email: 'user@example.com',
        password: 'password',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.accessToken).toBeDefined();
      });
  });

  it('/user/login (POST) - Error if email is already in use', async () => {
    const userModel = moduleFixture.get(getModelToken(User.name));
    await userModel.create({
      email: 'user@example.com',
      username: 'existing_user',
      password: 'password',
    });

    return request(app.getHttpServer())
      .post('/user/login')
      .send({
        email: 'wrong@example.com',
        password: 'password',
      })
      .expect(400)
      .expect((res) => {
        expect(res.body.message).toBe('Invalid email');
      });
  });
  it('/user/login (POST) - Error if the password is wrong', async () => {
    const userModel = moduleFixture.get(getModelToken(User.name));
    await userModel.create({
      email: 'user@example.com',
      username: 'existing_user',
      password: 'password',
    });

    return request(app.getHttpServer())
      .post('/user/login')
      .send({
        email: 'wrong@example.com',
        password: 'wrongePassword',
      })
      .expect(400)
      .expect((res) => {
        expect(res.body.message).toBe('Invalid email');
      });
  });
  it('/user/logout (POST)', async () => {
    await request(app.getHttpServer()).post('/user/register').send({
      email: 'user@example.com',
      username: 'user',
      password: 'password',
    });

    const loginResponse = await request(app.getHttpServer())
      .post('/user/login')
      .send({
        email: 'user@example.com',
        password: 'password',
      });

    const accessToken = loginResponse.body.accessToken;

    return request(app.getHttpServer())
      .post('/user/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(201)
      .expect((res) => {
        expect(res.body.message).toBe('Logout successful');
      });
  });

  it('/user/transactions (GET)', async () => {
    await request(app.getHttpServer()).post('/user/register').send({
      email: 'user@example.com',
      username: 'user',
      password: 'password',
    });

    const loginResponse = await request(app.getHttpServer())
      .post('/user/login')
      .send({
        email: 'user@example.com',
        password: 'password',
      });
    const accessToken = loginResponse.body.accessToken;

    return request(app.getHttpServer())
      .get('/user/history')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toBeInstanceOf(Array);
      });
  });
});
