import { prisma } from "./../../src/database.js";
import * as recommendationFactory from "./recommendationFactory.js"

export async function deleteAllData() {
    await prisma.$transaction([
    prisma.$executeRaw`TRUNCATE TABLE recommendations`,
    ]);
}

export async function fiveRecommendations() {
    const recommendation1 = await recommendationFactory.createRecommendation();
    const recommendation2 = await recommendationFactory.createRecommendation();
    const recommendation3 = await recommendationFactory.createRecommendation();
    const recommendation4 = await recommendationFactory.createRecommendation();
    const recommendation5 = await recommendationFactory.createRecommendation();
    return {
        recommendation1,
        recommendation2,
        recommendation3,
        recommendation4,
        recommendation5
    };
}