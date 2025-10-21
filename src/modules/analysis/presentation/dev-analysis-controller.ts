import { Body, Controller, Post } from "@nestjs/common";
import { AnalysisService } from "../application/analysis.service";
import { AnalyzeCommentDto } from "./dtos/sentiment.dto";


@Controller('dev/analysis')
export class DevAnalysisController {
    constructor(private readonly analysisService: AnalysisService) { }

    @Post('analyze-comment')
    async analyeComment(
        @Body() dto: AnalyzeCommentDto
    ) {
        const { headline, comment } = dto
        const result = await this.analysisService.analyzeComment(headline, comment)
        return result
    }
}