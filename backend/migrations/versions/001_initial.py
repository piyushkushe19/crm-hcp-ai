"""initial: create interactions table

Revision ID: 001_initial
Revises:
Create Date: 2024-01-01 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa

revision = '001_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'interactions',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('hcp_name', sa.String(255), nullable=False, index=True),
        sa.Column('specialty', sa.String(255), nullable=True),
        sa.Column('hospital', sa.String(255), nullable=True, index=True),
        sa.Column('interaction_type', sa.String(50), nullable=False, server_default='Visit'),
        sa.Column('datetime', sa.DateTime(timezone=True), nullable=True),
        sa.Column('summary', sa.Text(), nullable=True),
        sa.Column('products', sa.String(500), nullable=True),
        sa.Column('sentiment', sa.String(50), nullable=True, server_default='Neutral'),
        sa.Column('follow_up_required', sa.Boolean(), server_default='false'),
        sa.Column('follow_up_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('priority_level', sa.String(50), nullable=True, server_default='Medium'),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('source', sa.String(50), server_default='form'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now(), nullable=True),
    )


def downgrade() -> None:
    op.drop_table('interactions')
