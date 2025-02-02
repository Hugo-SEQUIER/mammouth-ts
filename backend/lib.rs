use anchor_lang::prelude::*;

declare_id!("2YU4ujreHtNHqA27Hh1WQoWFHm33uugCz1WhxnnCjoLf");

#[program]
pub mod gmoth {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}

