import { Module } from '@nestjs/common';
import { CandidatesService } from './candidates.service';
import { CandidatesResolver } from './candidates.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Candidate } from './entities/candidate.entity';
import { TeamsModule } from 'src/teams/teams.module';
import { CategoryModule } from 'src/category/category.module';
import { SectionsModule } from 'src/sections/sections.module';
import { CandidatesController } from './candidates.controller';

@Module({
  imports:[TypeOrmModule.forFeature([Candidate]) , TeamsModule , CategoryModule , SectionsModule],
  providers: [CandidatesResolver, CandidatesService],
  controllers: [CandidatesController],
  exports:[CandidatesService]
})
export class CandidatesModule {}
