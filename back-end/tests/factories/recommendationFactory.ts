import { faker } from "@faker-js/faker";

export function recommendationInput(){
    return {
        name: faker.music.songName(),
        youtubeLink: "https://www.youtube.com/watch?v=B39O1jXCFQQ&ab_channel=Rockloe",
    }
}

export function recommendationData(){
    return {
        id: 1,
        name: faker.music.songName(),
        youtubeLink: "https://www.youtube.com/watch?v=B39O1jXCFQQ&ab_channel=Rockloe",
        score: 0
    }
}

