import { faker } from "@faker-js/faker";
import { prisma } from "./../../src/database.js";

export const recommendationInput = {
    name: faker.music.songName(),
    youtubeLink: "https://www.youtube.com/watch?v=B39O1jXCFQQ&ab_channel=Rockloe"
}

export async function createRecommendation() {
    const recommendation = await prisma.recommendation.create({
        data: recommendationInput
    });
    return recommendation;
}