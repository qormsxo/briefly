import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserKeywords1730000003000 implements MigrationInterface {
  name = 'AddUserKeywords1730000003000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "user_keywords" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "userId" uuid NOT NULL,
        "kind" character varying(10) NOT NULL,
        "word" character varying(40) NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_keywords_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_user_keywords_userId_kind_word" UNIQUE ("userId", "kind", "word"),
        CONSTRAINT "FK_user_keywords_userId" FOREIGN KEY ("userId")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "user_keywords"`);
  }
}
