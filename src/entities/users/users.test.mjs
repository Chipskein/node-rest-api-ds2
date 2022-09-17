import {beforeAll, describe,expect,test} from 'vitest'
import request  from 'supertest'
import { CreateAppInstace } from '../../app.mjs'
import { CreateSequelizeInstance, RemoveDatabaseTest } from '../../config/sequelize.mjs';
import { HTTP_STATUS } from '../../config/http-status.mjs';
import { createJWT, verifyJWT } from '../../utils/token.mjs';
const database=CreateSequelizeInstance("test")
const app=CreateAppInstace(database);
beforeAll(async ()=>{
    await database.sync()
})

describe("Testing User Routes",()=>{
    const CreateUsersTestTable=[
        ["brunao","eaiman","fklajsfkasjfkas",HTTP_STATUS.BAD_REQUEST],
        [null,null,null,HTTP_STATUS.BAD_REQUEST],
        ["fasfa",null,null,HTTP_STATUS.BAD_REQUEST],
        ["Brunao","abfn0905@gmail.com","123456",HTTP_STATUS.OK],//1
        ["usuario ja existe","abfn0905@gmail.com","1234565125",HTTP_STATUS.CONFLICT],
        ["Brunao2","abfn09010@gmail.com","123456",HTTP_STATUS.OK],//2
        ["Brunao3","abfn0906@gmail.com","123456",HTTP_STATUS.OK],//3
        ["Brunao4","abfn0907@gmail.com","123456",HTTP_STATUS.OK],//4
        ["Brunao5","abfn0908@gmail.com","123456",HTTP_STATUS.OK],//5
        ["Brunao6","abfn0909@gmail.com","123456",HTTP_STATUS.OK],//6
    ]
    describe.each(CreateUsersTestTable)("Testing Register User name:%s email:%s password:%s",(name,email,password,expectedStatusCode)=>{
        test("POST /users/",async ()=>{
            const res=await request(app).post('/users/').send({
                name,
                email,
                password,
            })
            expect(res.statusCode).toBe(expectedStatusCode)
        })
    })
    const LoginUsersTestTable=[
        [null,"uma senha errada",HTTP_STATUS.UNAUTHORIZED],
        [null,null,HTTP_STATUS.UNAUTHORIZED],
        ["abfn0905@gmail.com","uma senha errada",HTTP_STATUS.UNAUTHORIZED],
        ["abfn0905@gmail.com","123456",HTTP_STATUS.OK],
        ["user@naoexiste.com.org","123456",HTTP_STATUS.UNAUTHORIZED],
    ]

    describe.each(LoginUsersTestTable)("Testing Login User email:%s password:%s",(email,password,expectedStatusCode)=>{
        test("POST /users/login",async ()=>{
            const res=await request(app).post('/users/login').send({
                email,
                password,
            })
            expect(res.statusCode).toBe(expectedStatusCode)
            if(res.statusCode==HTTP_STATUS.OK){
                const {body:{token}} = res
                expect(token).toBeTypeOf("string");
                expect(verifyJWT(token)).toBeDefined();
            }
        })
    })

    test("GET /users/",async ()=>{
        const res=await request(app).get('/users/').send()
        expect(res.statusCode).toBe(HTTP_STATUS.OK)
        expect(res.body.count).toBeGreaterThanOrEqual(0);
        expect(res.body.users.length).toBeGreaterThanOrEqual(0);
    })
    

    const GetUsersTestTable=[
        [12412,HTTP_STATUS.NOT_FOUND],
        [99123,HTTP_STATUS.NOT_FOUND],
        [9999,HTTP_STATUS.NOT_FOUND],
        [9999,HTTP_STATUS.NOT_FOUND],
        [915121,HTTP_STATUS.NOT_FOUND],
        [1,HTTP_STATUS.OK],
        [1.999999,HTTP_STATUS.BAD_REQUEST],
        [1.00000,HTTP_STATUS.OK],
        [1.12,HTTP_STATUS.BAD_REQUEST],
    ]
    describe.each(GetUsersTestTable)("Testing Get User Id:%d",(id,expectedStatusCode)=>{
        test("GET /users/:id",async ()=>{
            const res=await request(app).get(`/users/${id}`)
            expect(res.statusCode).toBe(expectedStatusCode)
            if(res.statusCode==HTTP_STATUS.OK){
                expect(res.body.password).toBeUndefined()
                expect(res.body.id).toBeDefined()
                expect(res.body.name).toBeDefined()
                expect(res.body.email).toBeDefined()
                expect(res.body.createdAt).toBeDefined()
                expect(res.body.updatedAt).toBeDefined()
            }
        })
    })

    const UpdateUsersTestTable=[
        ["USUARIO NEM EXISTE","FKLASJFKASJFKASJ",createJWT({id:9999,email:"usuario@naoexite.org"}),HTTP_STATUS.UNAUTHORIZED],
        ["DEVERIA FALHAR INCOSISTENCIA NO TOKEN","FKLASJFKASJFKASJ",createJWT({id:2,email:"abfn0905@gmail.com"}),HTTP_STATUS.UNAUTHORIZED],
        [null,null,createJWT({id:1,email:"abfn0905@gmail.com"}),HTTP_STATUS.BAD_REQUEST],
        ["Brunao update name",null,createJWT({id:1,email:"abfn0905@gmail.com"}),HTTP_STATUS.OK],
        [null,"novasenha",createJWT({id:1,email:"abfn0905@gmail.com"}),HTTP_STATUS.OK],
        [null,"novasenha",createJWT({id:1,email:"abfn0905@gmail.com"}),HTTP_STATUS.OK],
        ["update Brunao2","novasenha",createJWT({id:2,email:"abfn09010@gmail.com"}),HTTP_STATUS.OK],
    ]
    describe.each(UpdateUsersTestTable)("Testing Update User name:%s password %s token:%s",(name,password,token,expectedStatusCode)=>{
        test("PUT /users/",async ()=>{
            const res=await request(app).put("/users/").send({
                name,
                password,
            }).set('authorization',token);
            expect(res.statusCode).toBe(expectedStatusCode)
            
        })
    })
    const DeleteUsersTestTable=[
        [createJWT({id:1,email:"abfn0905@gmail.com"}),HTTP_STATUS.OK],//1
        [createJWT({id:2,email:"abfn09010@gmail.com"}),HTTP_STATUS.OK],//2
        [createJWT({id:3,email:"abfn0906@gmail.com"}),HTTP_STATUS.OK],//3
        [createJWT({id:4,email:"abfn0907@gmail.com"}),HTTP_STATUS.OK],//4
        [createJWT({id:5,email:"abfn0908@gmail.com"}),HTTP_STATUS.OK],//5
        [createJWT({id:6,email:"abfn0909@gmail.com"}),HTTP_STATUS.OK],//6
        [createJWT({id:6,email:"abfn0909@gmail.com"}),HTTP_STATUS.UNAUTHORIZED],//6
        [createJWT({id:1,email:"abfn0905@gmail.com"}),HTTP_STATUS.UNAUTHORIZED],//6
    ]
    describe.each(DeleteUsersTestTable)("Testing DELETE User name:%s password %s token:%s",(token,expectedStatusCode)=>{
        test("DELETE /users/",async ()=>{
            const res=await request(app).delete("/users/").set('authorization',token);
            expect(res.statusCode).toBe(expectedStatusCode)
            
        })
    })




})

afterAll(async ()=>{
    await RemoveDatabaseTest(database);
})



