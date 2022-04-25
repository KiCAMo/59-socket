import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class EntityHelper {
  @Field()
  @CreateDateColumn({
    default: () => 'CURRENT_TIMESTAMP',
  })
  public createdAt: Date;

  @Field()
  @UpdateDateColumn({
    default: () => 'CURRENT_TIMESTAMP',
  })
  public updatedAt: Date;
}
