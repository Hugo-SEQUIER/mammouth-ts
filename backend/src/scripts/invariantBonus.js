const { supabase } = require('../utils/supabaseClient');

const invariantBonus = async () => {
    const { data, error } = await supabase
        .from('users')
        .select('user_public_key')

    if (error) {
        console.error('Error retrieving users:', error);
        return;
    }

    for (const user of data) {
        console.log(user.user_public_key);
        try {
            await supabase.from('invariantbonus').insert({
                user_public_key: user.user_public_key,
                last_updated: new Date(),
            });
        } catch (error) {
            console.error('Error inserting invariant bonus:', error);
        }
    }
}

invariantBonus();
