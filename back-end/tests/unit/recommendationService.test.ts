import { recommendationService } from "../../src/services/recommendationsService";
import { recommendationRepository } from "../../src/repositories/recommendationRepository.js";
import * as scenarioFactory from "../factories/scenarioFactory.js"
import * as recommendationFactory from "../factories/recommendationFactory.js"
import { jest } from "@jest/globals";

describe("recommendationService test suite", () => {
    it("should create a recommendation", async () => {
        const recommendation = recommendationFactory.recommendationInput();
        jest.spyOn(recommendationRepository, 'findByName').mockImplementationOnce(():any => null);
        jest.spyOn(recommendationRepository, 'create').mockImplementationOnce(():any => null);
        await recommendationService.insert(recommendation);
        expect(recommendationRepository.create).toHaveBeenCalled();
    });

    it("should not create a recommendation with a name already in use", async () => {
        const recommendation = recommendationFactory.recommendationInput();
        jest.spyOn(recommendationRepository, 'findByName').mockImplementationOnce(():any => recommendation);
        jest.spyOn(recommendationRepository, 'create').mockImplementationOnce(():any => null);
        const promise = recommendationService.insert(recommendation);
        expect(recommendationRepository.create).toBeCalledTimes(1);
        expect(promise).rejects.toEqual({ type: "conflict", message: "Recommendations names must be unique." });
    });

    it("should upvote a recommendation", async () => {
        const recommendation = recommendationFactory.recommendationInput();
        jest.spyOn(recommendationRepository, 'find').mockImplementationOnce(():any => recommendation);
        jest.spyOn(recommendationRepository, 'updateScore').mockImplementationOnce(():any => null);
        await recommendationService.upvote(recommendation.id);
        expect(recommendationRepository.updateScore).toBeCalled();
    });
    
    it("should not upvote a recommendation that does not exist", async () => {
        const recommendation = recommendationFactory.recommendationInput();
        jest.spyOn(recommendationRepository, 'find').mockImplementationOnce(():any => null);
        jest.spyOn(recommendationRepository, 'updateScore').mockImplementationOnce(():any => null);
        const promise = recommendationService.upvote(recommendation.id);
        expect(recommendationRepository.updateScore).toBeCalled();
        expect(promise).rejects.toEqual({ type: "not_found", message: "" });
    });
    
});