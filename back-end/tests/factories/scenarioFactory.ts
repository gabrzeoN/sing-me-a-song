import { prisma } from "../../src/database.js";
import * as recommendationFactory from "./recommendationFactory.js"
import { agent } from "../integrations/app.test.js";

export async function deleteAllData() {
    await prisma.$transaction([
    prisma.$executeRaw`TRUNCATE TABLE recommendations`,
    ]);
}

export async function createRecommendation() {
    const recommendation = await prisma.recommendation.create({
        data: recommendationFactory.recommendationInput()
    });
    return recommendation;
}

export async function fiveRecommendations() {
    const recommendation1 = await createRecommendation();
    const recommendation2 = await createRecommendation();
    const recommendation3 = await createRecommendation();
    const recommendation4 = await createRecommendation();
    const recommendation5 = await createRecommendation();
    return [
        recommendation1,
        recommendation2,
        recommendation3,
        recommendation4,
        recommendation5
    ]
}

export async function fiveRecommendationsTwoUpvotedOneDownvoted() {
    const recommendations = await fiveRecommendations();
    await agent.post(`/recommendations/${recommendations[0].id}/downvote`);
    await agent.post(`/recommendations/${recommendations[3].id}/upvote`);
    await agent.post(`/recommendations/${recommendations[3].id}/upvote`);
    await agent.post(`/recommendations/${recommendations[4].id}/upvote`);
    
    return {
        upvoted1x: recommendations[4],
        upvoted2x: recommendations[3],
        downvoted1x: recommendations[0],
        nonvoted: [recommendations[1], recommendations[2]]
    };
}