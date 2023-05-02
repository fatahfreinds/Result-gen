import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { PositionService } from './position.service';
import { Position } from './entities/position.entity';
import { CreatePositionInput } from './dto/create-position.input';
import { UpdatePositionInput } from './dto/update-position.input';
import { AuthPipe } from './pipe/auth.pipe';
import { UsePipes } from '@nestjs/common';

@Resolver(() => Position)
export class PositionResolver {
  constructor(private readonly positionService: PositionService) {}

  @UsePipes(AuthPipe)
  @Mutation(() => Position)
  createPosition(@Args('createPositionInput') createPositionInput: CreatePositionInput) {
    return this.positionService.create(createPositionInput);
  }

  @Query(() => [Position], { name: 'positions' })
  findAll() {
    return this.positionService.findAll();
  }

  @Query(() => Position, { name: 'position' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.positionService.findOne(id);
  }

  @UsePipes(AuthPipe)
  @Mutation(() => Position)
  updatePosition(@Args('updatePositionInput') updatePositionInput: UpdatePositionInput) {
    return this.positionService.update(updatePositionInput.id, updatePositionInput);
  }

  @Mutation(() => Position)
  removePosition(@Args('id', { type: () => Int }) id: number) {
    return this.positionService.remove(id);
  }
}
