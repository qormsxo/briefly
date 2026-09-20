import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1730000000000 implements MigrationInterface {
  name = 'InitSchema1730000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "kakaoId" character varying NOT NULL,
        "nickname" character varying,
        "email" character varying,
        "kakaoAccessToken" text NOT NULL,
        "kakaoRefreshToken" text NOT NULL,
        "kakaoTokenExpiresAt" TIMESTAMP WITH TIME ZONE,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_kakaoId" UNIQUE ("kakaoId")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "feeds" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "userId" uuid NOT NULL,
        "url" character varying NOT NULL,
        "title" character varying,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_feeds_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_feeds_userId_url" UNIQUE ("userId", "url"),
        CONSTRAINT "FK_feeds_userId" FOREIGN KEY ("userId")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "articles" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "feedId" uuid NOT NULL,
        "userId" character varying NOT NULL,
        "title" character varying NOT NULL,
        "link" character varying NOT NULL,
        "summary" text NOT NULL,
        "interest" smallint NOT NULL DEFAULT 5,
        "publishedAt" TIMESTAMP WITH TIME ZONE,
        "collectedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "kakaoSentAt" TIMESTAMP WITH TIME ZONE,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_articles_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_articles_feedId_link" UNIQUE ("feedId", "link"),
        CONSTRAINT "FK_articles_feedId" FOREIGN KEY ("feedId")
          REFERENCES "feeds"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_articles_userId_collectedAt" ON "articles" ("userId", "collectedAt")`,
    );

    await queryRunner.query(`
      CREATE TABLE "digest_logs" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "userId" character varying NOT NULL,
        "status" character varying NOT NULL,
        "articleCount" integer NOT NULL DEFAULT 0,
        "errorMessage" text,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_digest_logs_id" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "digest_logs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "articles"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "feeds"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
  }
}
