import { InputType, Int, Field } from '@nestjs/graphql';
import { IsNotEmpty} from 'class-validator';

@InputType()
export class CreateCandidateProgrammeInput {
  @Field()
  @IsNotEmpty()
  programme_code: string;

  @IsNotEmpty()
  @Field(()=>Int)
  chestNo: number;

  @Field(()=>[Int] , {nullable:true})
  candidatesOfGroup : number[] ;
}
