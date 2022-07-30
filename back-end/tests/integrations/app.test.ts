import { faker } from "@faker-js/faker";
import supertest from "supertest";
import app from "../../src/app.js";
import { prisma } from "../../src/database.js";
import * as scenarioFactory from "../factories/scenarioFactory.js"
import * as recommendationFactory from "../factories/recommendationFactory.js"

export const agent = supertest(app);

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

describe("/GET recommendations/:id", ()=> {
    it("not possible to get recommendation that does not exist, 404",async () => {
        const response = await agent.get("/recommendations/0")
        expect(response.statusCode).toEqual(404);
    });

    it("is possible to get a recommendation by its id, 200",async () => {
        const recommendations = await scenarioFactory.fiveRecommendations();
        const response = await agent.get(`/recommendations/${recommendations[3].id}`);
        expect(response.statusCode).toEqual(200);
        expect(response.body.id).toEqual(recommendations[3].id);
    });
});

describe("/POST recommendations/:id/upvote", ()=> {
    it("it is not possible to upvote a recommendation that does not exist, 404",async () => {
        const response = await agent.post("/recommendations/0/upvote")
        expect(response.statusCode).toEqual(404);
        const recommendationCreated = await prisma.recommendation.findMany({
            where: {id: 0}
        });
        expect(recommendationCreated.length).toEqual(0);
    });

    it("it is possible to upvote a recommendation, 200",async () => {
        const recommendations = await scenarioFactory.fiveRecommendations();
        const response = await agent.post(`/recommendations/${recommendations[3].id}/upvote`);
        expect(response.statusCode).toEqual(200);
        const recommendationCreated = await prisma.recommendation.findMany({
            where: {id: recommendations[3].id, score: 1}
        });
        expect(recommendationCreated.length).toEqual(1);
    });
});

describe("/POST recommendations/:id/downvote", ()=> {
    it("it is not possible to downvote a recommendation that does not exist, 404",async () => {
        const response = await agent.post("/recommendations/0/downvote")
        expect(response.statusCode).toEqual(404);
        const recommendationCreated = await prisma.recommendation.findMany({
            where: {id: 0}
        });
        expect(recommendationCreated.length).toEqual(0);
    });

    it("it is possible to downvote a recommendation, 200",async () => {
        const recommendations = await scenarioFactory.fiveRecommendations();
        const response = await agent.post(`/recommendations/${recommendations[3].id}/downvote`);
        expect(response.statusCode).toEqual(200);
        const recommendationCreated = await prisma.recommendation.findMany({
            where: {id: recommendations[3].id, score: -1}
        });
        expect(recommendationCreated.length).toEqual(1);
    });
});

describe("/POST recommendations/top/:amount", ()=> {
    it("only the 2 upvoteds recommendations, 200",async () => {
        const recommendations = await scenarioFactory.fiveRecommendationsTwoUpvotedOneDownvoted();
        const response = await agent.get(`/recommendations/top/2`);
        expect(response.statusCode).toEqual(200);
        const recommendationCreated = await prisma.recommendation.findMany({
            orderBy: { score: "desc" },
            take: 2,
        });
        expect(recommendationCreated.length).toEqual(2);
        expect(recommendationCreated[0].id).toEqual(recommendations.upvoted2x.id);
        expect(recommendationCreated[1].id).toEqual(recommendations.upvoted1x.id);
    });

    it("all top recommendations, 200",async () => {
        const recommendations = await scenarioFactory.fiveRecommendationsTwoUpvotedOneDownvoted();
        const response = await agent.get(`/recommendations/top/5`);
        expect(response.statusCode).toEqual(200);
        const recommendationCreated = await prisma.recommendation.findMany({
            orderBy: { score: "desc" },
            take: 5,
        });
        expect(recommendationCreated.length).toEqual(5);
        expect(recommendationCreated[0].id).toEqual(recommendations.upvoted2x.id);
        expect(recommendationCreated[1].id).toEqual(recommendations.upvoted1x.id);
        expect([recommendations.nonvoted[0].id, recommendations.nonvoted[1].id]).toContain(recommendationCreated[2].id);
        expect([recommendations.nonvoted[0].id, recommendations.nonvoted[1].id]).toContain(recommendationCreated[3].id);
        expect(recommendationCreated[4].id).toEqual(recommendations.downvoted1x.id);
    });

    it("returns 5 recomendations even if amount is greater than 5, 200",async () => {
        const recommendations = await scenarioFactory.fiveRecommendationsTwoUpvotedOneDownvoted();
        const response = await agent.get(`/recommendations/top/7`);
        expect(response.statusCode).toEqual(200);
        const recommendationCreated = await prisma.recommendation.findMany({
            orderBy: { score: "desc" },
            take: 5,
        });
        expect(recommendationCreated.length).toEqual(5);
        expect(recommendationCreated[0].id).toEqual(recommendations.upvoted2x.id);
        expect(recommendationCreated[1].id).toEqual(recommendations.upvoted1x.id);
        expect([recommendations.nonvoted[0].id, recommendations.nonvoted[1].id]).toContain(recommendationCreated[2].id);
        expect([recommendations.nonvoted[0].id, recommendations.nonvoted[1].id]).toContain(recommendationCreated[3].id);
        expect(recommendationCreated[4].id).toEqual(recommendations.downvoted1x.id);
    });

    it("amount is not send through params, 500",async () => {
        await scenarioFactory.fiveRecommendationsTwoUpvotedOneDownvoted();
        const response = await agent.get(`/recommendations/top/`);
        expect(response.statusCode).toEqual(500);
    });
});

describe("/GET recommendations/random", ()=> {
    it("there must be a random recommendation, 200",async () => {
        await scenarioFactory.fiveRecommendationsTwoUpvotedOneDownvoted();
        const response = await agent.get("/recommendations/random");
        expect(response.statusCode).toEqual(200);
    });
});