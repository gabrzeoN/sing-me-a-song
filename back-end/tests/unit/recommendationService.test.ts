import { recommendationService } from "../../src/services/recommendationsService";
import { recommendationRepository } from "../../src/repositories/recommendationRepository.js";
import * as recommendationFactory from "../factories/recommendationFactory.js"
import { jest } from "@jest/globals";

beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
});

describe("recommendationService test suite", () => {
    it("should create a recommendation", async () => {
        const recommendation = recommendationFactory.recommendationInput();
        jest.spyOn(recommendationRepository, 'findByName').mockImplementationOnce(():any => null);
        jest.spyOn(recommendationRepository, 'create').mockImplementationOnce(():any => null);
        await recommendationService.insert(recommendation);
        expect(recommendationRepository.create).toHaveBeenCalled();
    });

    it("should not create a recommendation with a name already in use", () => {
        const recommendation = recommendationFactory.recommendationInput();
        jest.spyOn(recommendationRepository, 'findByName').mockImplementationOnce(():any => recommendation);
        jest.spyOn(recommendationRepository, 'create').mockImplementationOnce(():any => null);
        const promise = recommendationService.insert(recommendation);
        expect(recommendationRepository.create).not.toBeCalled();
        expect(promise).rejects.toEqual({ type: "conflict", message: "Recommendations names must be unique." });
    });

    it("should upvote a recommendation", async () => {
        const recommendation = recommendationFactory.recommendationInput();
        jest.spyOn(recommendationRepository, 'find').mockImplementationOnce(():any => recommendation);
        jest.spyOn(recommendationRepository, 'updateScore').mockImplementationOnce(():any => null);
        await recommendationService.upvote(recommendation.id);
        expect(recommendationRepository.updateScore).toBeCalled();
    });
    
    it("should not upvote a recommendation that does not exist", () => {
        const recommendation = recommendationFactory.recommendationInput();
        jest.spyOn(recommendationRepository, 'find').mockImplementationOnce(():any => null);
        jest.spyOn(recommendationRepository, 'updateScore').mockImplementationOnce(():any => null);
        const promise = recommendationService.upvote(recommendation.id);
        expect(promise).rejects.toEqual({ type: "not_found", message: "" });
    });
    
    it("should downvote a recommendation, but not remove it", async () => {
        const recommendation = recommendationFactory.recommendationInput();
        jest.spyOn(recommendationRepository, 'find').mockImplementationOnce(():any => recommendation);
        jest.spyOn(recommendationRepository, 'updateScore').mockImplementationOnce(():any => { 
            return {...recommendation, score: 0}
        });
        jest.spyOn(recommendationRepository, 'remove').mockImplementationOnce(():any => null);
        await recommendationService.downvote(recommendation.id);
        expect(recommendationRepository.updateScore).toBeCalled();
        expect(recommendationRepository.remove).not.toBeCalled();
    });
    
    it("should downvote and remove a recommendation because it has more than 5 downvotes", async () => {
        const recommendation = recommendationFactory.recommendationInput();
        jest.spyOn(recommendationRepository, 'find').mockImplementationOnce(():any => recommendation);
        jest.spyOn(recommendationRepository, 'updateScore').mockImplementation(():any => {
            return {...recommendation, score: -6}
        });
        jest.spyOn(recommendationRepository, 'remove').mockImplementationOnce(():any => null);
        await recommendationService.downvote(1);
        expect(recommendationRepository.updateScore).toBeCalled();
        expect(recommendationRepository.remove).toBeCalled();
    });

    it("should not downvote a recommendation that does not exist", () => {
        const recommendation = recommendationFactory.recommendationInput();
        jest.spyOn(recommendationRepository, 'find').mockImplementationOnce(():any => null);
        jest.spyOn(recommendationRepository, 'updateScore').mockImplementationOnce(():any => null);
        const promise = recommendationService.downvote(recommendation.id);
        expect(promise).rejects.toEqual({ type: "not_found", message: "" });
    });

    it("should get all recommendations", async () => {
        const recommendation = recommendationFactory.recommendationInput();
        jest.spyOn(recommendationRepository, 'findAll').mockImplementationOnce(():any => recommendation);
        await recommendationService.get();
        expect(recommendationRepository.findAll).toHaveBeenCalled();
    });

    it("should get the top recommendation", async () => {
        const recommendation = recommendationFactory.recommendationInput();
        jest.spyOn(recommendationRepository, 'getAmountByScore').mockImplementationOnce(():any => recommendation);
        await recommendationService.getTop(1);
        expect(recommendationRepository.getAmountByScore).toHaveBeenCalled();
    });

    it("should get a random recommendation with 'gt' filter", async () => {
        const recommendation = recommendationFactory.recommendationInput();
        const randomNumber = 0.5;
        jest.spyOn(global.Math, 'random').mockReturnValue(randomNumber);
        jest.spyOn(recommendationRepository, 'findAll').mockImplementationOnce(():any => {
            return [ {...recommendation}, {...recommendation} ]
        });
        const promise = await recommendationService.getRandom();
        expect(promise).toEqual(recommendation);
    });

    it("should get a random recommendation with 'lte' filter", async () => {
        const recommendation = recommendationFactory.recommendationInput();
        const randomNumber = 0.9;
        jest.spyOn(global.Math, 'random').mockReturnValue(randomNumber);
        jest.spyOn(recommendationRepository, 'findAll').mockImplementationOnce(():any => {
            return [ {...recommendation}, {...recommendation} ]
        });
        const promise = await recommendationService.getRandom();
        expect(promise).toEqual(recommendation);
    });

    it("should get a random recommendations from findAll with no filter because it couldn't find any with a filter", async () => {
        const recommendation = recommendationFactory.recommendationInput();
        const randomNumber = 0.9;
        jest.spyOn(global.Math, 'random').mockReturnValue(randomNumber);
        jest.spyOn(recommendationRepository, 'findAll').mockImplementationOnce(():any => []);
        jest.spyOn(recommendationRepository, 'findAll').mockImplementationOnce(():any => {
            return [ {...recommendation}, {...recommendation} ]
        });
        const promise = await recommendationService.getRandom();
        expect(promise).toEqual(recommendation);
    });

    it("should not get a random recommendation because there is not any", async () => {
        const randomNumber = 0.9;
        jest.spyOn(global.Math, 'random').mockReturnValue(randomNumber);
        jest.spyOn(recommendationRepository, 'findAll').mockImplementationOnce(():any => []);
        jest.spyOn(recommendationRepository, 'findAll').mockImplementationOnce(():any => []);
        const promise = recommendationService.getRandom();
        expect(promise).rejects.toEqual({ type: "not_found", message: "" });
    });
});