import { Resolver, Query, Mutation, Args, Int, Context, Info } from '@nestjs/graphql';
import { CandidateProgrammeService } from './candidate-programme.service';
import { CandidateProgramme } from './entities/candidate-programme.entity';
import { CreateCandidateProgrammeInput } from './dto/create-candidate-programme.input';
import { UpdateCandidateProgrammeInput } from './dto/update-candidate-programme.input';
import { UseGuards } from '@nestjs/common';
import { HasRoles, RolesGuard } from 'src/credentials/roles/roles.guard';
import { Roles } from 'src/credentials/roles/roles.enum';
import { fieldsProjection } from 'graphql-fields-list';

@Resolver(() => CandidateProgramme)
export class CandidateProgrammeResolver {
  constructor(
    private readonly candidateProgrammeService: CandidateProgrammeService,
  ) {}

  // @UsePipes(CandidateProgrammePipe)
  @HasRoles(Roles.Controller, Roles.TeamManager)
  @UseGuards(RolesGuard)
  @Mutation(() => CandidateProgramme)
  createCandidateProgramme(
    @Args('createCandidateProgrammeInput')
    createCandidateProgrammeInput: CreateCandidateProgrammeInput ,
    @Context('req') req: any,
  ) {
    return this.candidateProgrammeService.create(createCandidateProgrammeInput, req.user);
  }

  @Query(() => [CandidateProgramme], { name: 'candidateProgrammes' })
  findAll(
    @Info() info: any,
  ) {
    const fields = Object.keys(fieldsProjection(info));
    return this.candidateProgrammeService.findAll( fields);
  }

  @Query(() => CandidateProgramme, { name: 'candidateProgramme' })
  findOne(@Args('id', { type: () => Int }) id: number , @Info() info: any) {
    const fields = Object.keys(fieldsProjection(info));
    return this.candidateProgrammeService.findOne(id);
  }

  // @UsePipes(CandidateProgrammePipe)
  @Mutation(() => CandidateProgramme)
  @HasRoles(Roles.Controller, Roles.TeamManager)
  @UseGuards(RolesGuard)
  updateCandidateProgramme(
    @Args('updateCandidateProgrammeInput')
    updateCandidateProgrammeInput: UpdateCandidateProgrammeInput,
    @Context('req') req: any,
  ) {
    return this.candidateProgrammeService.update(
      updateCandidateProgrammeInput.id,
      updateCandidateProgrammeInput,
      req.user,
    );
  }

  @Mutation(() => CandidateProgramme)
  @HasRoles(Roles.Controller, Roles.TeamManager)
  @UseGuards(RolesGuard)
  removeCandidateProgramme(@Args('id', { type: () => Int }) id: number, @Context('req') req: any) {
    return this.candidateProgrammeService.remove(id, req.user);
  }
}
