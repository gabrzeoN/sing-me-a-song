import { faker } from "@faker-js/faker";
import supertest from "supertest";
import app from "../src/app.js";
import { prisma } from "./../src/database.js";
import * as scenarioFactory from "./factories/scenarioFactory.js"
import * as recommendationFactory from "./factories/recommendationFactory.js"

const agent = supertest(app);

beforeEach(async () => {
    await scenarioFactory.deleteAllData();
});

describe("/POST recommendations", ()=> {
    it("given valid inputs, 201",async () => {
        const recommendation = recommendationFactory.recommendationInput();
        const response = await agent.post("/recommendations").send(recommendation);
        expect(response.statusCode).toEqual(201);
        const recommendationCreated = await prisma.recommendation.findFirst({
            where: {name: recommendation.name}
        });
        expect(recommendationCreated).not.toEqual(null);
    });

    it("given two recommendations with same name, 409",async () => {
        const recommendation = recommendationFactory.recommendationInput();
        await agent.post("/recommendations").send(recommendation);
        const response = await agent.post("/recommendations").send(recommendation);
        expect(response.statusCode).toEqual(409);
        const recommendationCreated = await prisma.recommendation.findMany({
            where: {name: recommendation.name}
        });
        expect(recommendationCreated.length).toEqual(1);
    });

    it("given input with no name, 422",async () => {
        const recommendation = recommendationFactory.recommendationInput();
        const response = await agent.post("/recommendations").send({...recommendation, name: ""});
        expect(response.statusCode).toEqual(422);
        const recommendationCreated = await prisma.recommendation.findMany({
            where: {name: recommendation.name}
        });
        expect(recommendationCreated.length).toEqual(0);
    });

    it("given input with no youtubeLink, 422",async () => {
        const recommendation = recommendationFactory.recommendationInput();
        const response = await agent.post("/recommendations").send({...recommendation, youtubeLink: ""});
        expect(response.statusCode).toEqual(422);
        const recommendationCreated = await prisma.recommendation.findMany({
            where: {name: recommendation.name}
        });
        expect(recommendationCreated.length).toEqual(0);
    });

    it("given input with invalid youtubeLink, 422",async () => {
        const recommendation = recommendationFactory.recommendationInput();
        const response = await agent.post("/recommendations").send({
            ...recommendation, youtubeLink: faker.internet.url()
        });
        expect(response.statusCode).toEqual(422);
        const recommendationCreated = await prisma.recommendation.findMany({
            where: {name: recommendation.name}
        });
        expect(recommendationCreated.length).toEqual(0);
    });
});

describe("/GET recommendations", ()=> {
    it("there must be no recommendation, 200",async () => {
        const response = await agent.get("/recommendations")
        expect(response.statusCode).toEqual(200);
        const recommendationCreated = await prisma.recommendation.findMany();
        expect(recommendationCreated.length).toEqual(0);
    });

    it("there must be 5 recommendations, 200",async () => {
        await scenarioFactory.fiveRecommendations();
        const response = await agent.get("/recommendations")
        expect(response.statusCode).toEqual(200);
        const recommendationCreated = await prisma.recommendation.findMany();
        expect(recommendationCreated.length).toEqual(5);
    });
});