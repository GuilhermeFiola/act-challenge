import {ConsolidationEntity} from '../../core/entity/consolidation.entity'
import {ConsolidationResponseDto} from '../../application/dto/consolidation.response.dto'

export class ConsolidationMapper {
    static MapEntityToResponseDto(consolidation: ConsolidationEntity): ConsolidationResponseDto {
        return <ConsolidationResponseDto> {
            id: consolidation.id,
            inflow: consolidation.inflow,
            outflow: consolidation.outflow,
            netValue: consolidation.netValue,
            date: consolidation.date.toISOString(),
        }
    }
}