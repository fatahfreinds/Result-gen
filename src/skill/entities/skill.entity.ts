import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Programme } from 'src/programmes/entities/programme.entity';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@ObjectType()
@Entity()
export class Skill {

  // Primary generated ID
  @Field(() => Int, { description: '' })
  @PrimaryGeneratedColumn()
  id: number;

  // Normal columns

  @Column({unique:true})
  @Field()
  name: string;

  @Column({unique:true})
  @Field()
  shortName: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  description: string;

  // OneToMany relations

  @OneToMany(() => Programme, (programme) => programme.skill)
  @Field(() => [Programme], { nullable: true })
  programmes: Programme[];

  // Dates
  
  @CreateDateColumn()
  @Field(() => Date)
  createdAt: Date;

  @UpdateDateColumn()
  @Field(() => Date)
  updatedAt: Date;

}
