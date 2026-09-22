import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserThemes1730000002000 implements MigrationInterface {
  name = 'AddUserThemes1730000002000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "user_themes" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "userId" uuid NOT NULL,
        "theme" character varying(40) NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_themes_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_user_themes_userId_theme" UNIQUE ("userId", "theme"),
        CONSTRAINT "FK_user_themes_userId" FOREIGN KEY ("userId")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "theme" character varying(40)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "articles" DROP COLUMN IF EXISTS "theme"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "user_themes"`);
  }
}
