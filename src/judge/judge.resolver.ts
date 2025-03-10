import { Resolver, Query, Mutation, Args, Int, Context, Info } from '@nestjs/graphql';
import { JudgeService } from './judge.service';
import { Judge } from './entities/judge.entity';
import { CreateJudgeInput } from './dto/create-judge.input';
import { UpdateJudgeInput } from './dto/update-judge.input';
import { HasRoles, RolesGuard } from 'src/credentials/roles/roles.guard';
import { Roles } from 'src/credentials/roles/roles.enum';
import { UseGuards } from '@nestjs/common';
import { arrayInput } from 'src/candidate-programme/dto/array-input.dto';
import { fieldsProjection } from 'graphql-fields-list';

@Resolver(() => Judge)
export class JudgeResolver {
  constructor(private readonly judgeService: JudgeService) {}

  @Mutation(() => Judge)
  @HasRoles(Roles.Controller)
  @UseGuards(RolesGuard)
  createJudge(
    @Args('createJudgeInput') createJudgeInput: CreateJudgeInput,
    @Context('req') req: any,
  ) {
    return this.judgeService.create(createJudgeInput, req.user);
  }

  @Query(() => [Judge], { name: 'judges' })
  findAll(@Info() info: any) {
    const fields = Object.keys(fieldsProjection(info));
    return this.judgeService.findAll(fields);
  }

  @Query(() => Judge, { name: 'judge' })
  findOne(@Args('id', { type: () => Int }) id: number, @Info() info: any) {
    const fields = Object.keys(fieldsProjection(info));
    return this.judgeService.findOne(id, fields);
  }

  @Mutation(() => Judge)
  @HasRoles(Roles.Controller)
  @UseGuards(RolesGuard)
  updateJudge(
    @Args('updateJudgeInput') updateJudgeInput: UpdateJudgeInput,
    @Context('req') req: any,
  ) {
    return this.judgeService.update(updateJudgeInput.id, updateJudgeInput, req.user);
  }

  @Mutation(() => Judge)
  @HasRoles(Roles.Controller)
  @UseGuards(RolesGuard)
  removeJudge(@Args('id', { type: () => Int }) id: number, @Context('req') req: any) {
    return this.judgeService.remove(id);
  }

  @Mutation(() => String)
  uploadMarkByJudge(
    @Args('programmeCode') programmeCode: string,
    @Args('jugdeId') JudgeId: number,
    @Args({ name: 'addResult', type: () => arrayInput })
    addResult: arrayInput,
  ) {
    return this.judgeService.uploadMarkByJudge(JudgeId, programmeCode, addResult);
  }
}
