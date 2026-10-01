/**
 * Question entity (JN-079).
 * Product Q&A, customer inquiry, and official Kathmandu workshop answer.
 */
import type { QuestionId, ProductId } from '../common/entity-id.js';
import { DomainError } from '../errors/index.js';

export interface Answer {
  readonly answerId: string;
  readonly answerText: string;
  readonly answeredBy: string;
  readonly isOfficialArtisan: boolean;
  readonly answeredAt: Date;
}

export interface QuestionProps {
  readonly id: QuestionId;
  readonly productId: ProductId;
  readonly authorName: string;
  readonly questionText: string;
  readonly answers?: readonly Answer[];
  readonly isPublished?: boolean;
  readonly createdAt?: Date;
}

export class Question {
  readonly id: QuestionId;
  readonly productId: ProductId;
  readonly authorName: string;
  readonly questionText: string;
  private readonly _answers: Answer[];
  private _isPublished: boolean;
  readonly createdAt: Date;

  constructor(props: QuestionProps) {
    if (!props.questionText?.trim()) {
      throw new DomainError('Question text cannot be empty');
    }

    this.id = props.id;
    this.productId = props.productId;
    this.authorName = props.authorName.trim();
    this.questionText = props.questionText.trim();
    this._answers = props.answers ? [...props.answers] : [];
    this._isPublished = props.isPublished ?? true;
    this.createdAt = props.createdAt ?? new Date();
  }

  get answers(): readonly Answer[] {
    return [...this._answers];
  }

  get isPublished(): boolean {
    return this._isPublished;
  }

  addAnswer(answerText: string, answeredBy: string, isOfficialArtisan: boolean): void {
    if (!answerText.trim()) {
      throw new DomainError('Answer text cannot be empty');
    }
    this._answers.push({
      answerId: `ans_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      answerText: answerText.trim(),
      answeredBy: answeredBy.trim(),
      isOfficialArtisan,
      answeredAt: new Date(),
    });
  }

  publish(): void {
    this._isPublished = true;
  }

  hide(): void {
    this._isPublished = false;
  }
}
