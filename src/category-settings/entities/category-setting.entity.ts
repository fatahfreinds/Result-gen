import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Category } from 'src/category/entities/category.entity';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity()
export class CategorySettings {

  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number

  @Field(() => Int)
  @Column()
  maxProgram: number;

  @Field(() => Int)
  @Column()
  maxSingle: number;

  @Field(() => Int)
  @Column()
  minProgram: number;

  @Field(() => Int)
  @Column()
  minSingle: number;

  @Field(() => Int)
  @Column()
  maxGroup : number;
  
  @Field(() => Int)
  @Column()
  minGroup : number;

  @OneToOne(()=> Category , (category)=> category.settings)
  @Field(()=>Category)
  category:Category;

}
